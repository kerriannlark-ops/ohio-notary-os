import SwiftData
import SwiftUI

struct RootShellView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \CourseDocument.createdAt) private var documents: [CourseDocument]
    @Query(sort: \StudyNote.createdAt, order: .reverse) private var notes: [StudyNote]
    @Query(sort: \DocumentBookmark.createdAt, order: .reverse) private var bookmarks: [DocumentBookmark]
    @Query(sort: \LaunchMilestone.sortOrder) private var milestones: [LaunchMilestone]
    @Query(sort: \LaunchTask.title) private var tasks: [LaunchTask]
    @Query private var configs: [NotaryAppConfig]
    @Query(sort: \StudyProgress.documentID) private var progressRecords: [StudyProgress]

    @State private var selection: AppSection? = .startHere
    @State private var selectedDocumentID: String?
    @State private var bootstrapError: String?
    @State private var bootstrapped = false

    var body: some View {
        NavigationSplitView {
            List(AppSection.sidebarCases, selection: $selection) { section in
                Label(section.title, systemImage: section.systemImage)
                    .font(.notarySerif(16))
                    .tag(section)
            }
            .listStyle(.sidebar)
            .navigationTitle("Notary OS")
        } detail: {
            ZStack {
                if let bootstrapError {
                    ErrorStateView(title: "Setup issue", message: bootstrapError)
                } else if !bootstrapped {
                    ProgressView("Preparing Notary OS…")
                        .font(.notarySerif(16))
                } else {
                    detailView
                }
            }
            .notaryBackground()
        }
        .task {
            guard !bootstrapped else { return }
            do {
                try AppBootstrapper.bootstrap(context: modelContext)
                bootstrapped = true
                if selectedDocumentID == nil {
                    selectedDocumentID = documents.first?.id
                }
            } catch {
                bootstrapError = error.localizedDescription
            }
        }
        .onChange(of: documents.count) { _, _ in
            if selectedDocumentID == nil {
                selectedDocumentID = documents.first?.id
            }
        }
    }

    @ViewBuilder
    private var detailView: some View {
        let snapshot = NotaryOSLogic.readinessSnapshot(documents: documents, progress: progressRecords, milestones: milestones)
        let config = configs.first
        let activeDocument = documents.first(where: { $0.id == selectedDocumentID }) ?? documents.first

        switch selection ?? .startHere {
        case .startHere:
            HomeView(
                snapshot: snapshot,
                milestones: milestones,
                onResumeStudy: {
                    selectedDocumentID = snapshot.recommendedDocumentID ?? documents.first?.id
                    selection = .studySession
                },
                onOpenOperations: { selection = .operations }
            )
        case .courseLibrary:
            CourseLibraryView(
                documents: documents,
                progressRecords: progressRecords,
                onOpen: { document in
                    selectedDocumentID = document.id
                    selection = .studySession
                }
            )
        case .studyProgress:
            StudyProgressView(
                documents: documents,
                progressRecords: progressRecords,
                notes: notes,
                bookmarks: bookmarks,
                onResume: { document in
                    selectedDocumentID = document.id
                    selection = .studySession
                }
            )
        case .licensingChecklist:
            LicensingChecklistView(
                milestones: milestones,
                tasks: tasks,
                onToggleTask: toggleTask,
                onSaveNotes: saveMilestoneNotes
            )
        case .operations:
            OperationsView(config: config)
        case .settings:
            if let config {
                SettingsView(config: config, onSave: saveContext)
            } else {
                EmptyStateView(title: "Settings unavailable", message: "The local app configuration is still loading.")
            }
        case .studySession:
            if let activeDocument {
                StudySessionView(
                    document: activeDocument,
                    progress: progressRecords.first(where: { $0.documentID == activeDocument.id }),
                    notes: notes.filter { $0.documentID == activeDocument.id },
                    bookmarks: bookmarks.filter { $0.documentID == activeDocument.id },
                    onProgressUpdate: updateProgress,
                    onAddNote: addNote,
                    onAddBookmark: addBookmark,
                    onMarkReviewed: markReviewed,
                    onBackToLibrary: { selection = .courseLibrary }
                )
            } else {
                EmptyStateView(title: "No course packet found", message: "The study library has not been initialized yet.")
            }
        }
    }

    private func toggleTask(_ task: LaunchTask) {
        task.isComplete.toggle()
        task.completedAt = task.isComplete ? Date() : nil

        if let milestone = milestones.first(where: { $0.id == task.milestoneID }) {
            let scopedTasks = tasks.filter { $0.milestoneID == milestone.id }
            let allComplete = scopedTasks.allSatisfy(\.isComplete)
            milestone.isComplete = allComplete
            milestone.completedAt = allComplete ? Date() : nil
        }

        saveContext()
    }

    private func saveMilestoneNotes(_ milestone: LaunchMilestone, notes: String) {
        milestone.ownerNotes = notes.isEmpty ? nil : notes
        saveContext()
    }

    private func updateProgress(document: CourseDocument, page: Int) {
        let record = progressRecords.first(where: { $0.documentID == document.id }) ?? {
            let newRecord = StudyProgress(documentID: document.id)
            modelContext.insert(newRecord)
            return newRecord
        }()

        record.lastPageRead = page
        let totalPages = max(document.pageCount, 1)
        record.percentComplete = min(max(Double(page) / Double(totalPages), 0), 1)
        record.lastStudiedAt = Date()
        document.lastOpenedAt = Date()
        if record.percentComplete > 0, document.documentStatus == .notStarted {
            document.documentStatus = .reading
        }
        saveContext()
    }

    private func addNote(document: CourseDocument, page: Int, text: String) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        modelContext.insert(StudyNote(documentID: document.id, pageNumber: page, noteText: trimmed))
        saveContext()
    }

    private func addBookmark(document: CourseDocument, page: Int, label: String) {
        let trimmed = label.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        modelContext.insert(DocumentBookmark(documentID: document.id, pageNumber: page, label: trimmed))
        saveContext()
    }

    private func markReviewed(document: CourseDocument) {
        document.documentStatus = .reviewed
        let record = progressRecords.first(where: { $0.documentID == document.id }) ?? {
            let newRecord = StudyProgress(documentID: document.id)
            modelContext.insert(newRecord)
            return newRecord
        }()
        record.percentComplete = 1
        record.lastPageRead = max(document.pageCount, 1)
        record.lastStudiedAt = Date()
        saveContext()
    }

    private func saveContext() {
        try? modelContext.save()
    }
}

struct HomeView: View {
    let snapshot: ReadinessSnapshot
    let milestones: [LaunchMilestone]
    let onResumeStudy: () -> Void
    let onOpenOperations: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                SectionTitle(
                    eyebrow: "Start Here",
                    title: "Your next step is clear.",
                    subtitle: "Track the course, licensing progress, and revenue readiness in one place."
                )

                HStack(alignment: .top, spacing: 16) {
                    VStack(alignment: .leading, spacing: 14) {
                        Text(snapshot.nextActionTitle)
                            .font(.notarySerif(28, weight: .semibold))
                            .foregroundStyle(NotaryPalette.ink)
                        Text(snapshot.nextActionDetail)
                            .font(.notarySerif(16))
                            .foregroundStyle(NotaryPalette.walnut)
                            .lineSpacing(3)
                        HStack(spacing: 12) {
                            Button("Resume Study", action: onResumeStudy)
                                .buttonStyle(PrimaryButtonStyle())
                            Button("Open Operations", action: onOpenOperations)
                                .buttonStyle(SecondaryButtonStyle())
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    VStack(alignment: .leading, spacing: 10) {
                        PermissionRow(label: "In-person acts", allowed: snapshot.canOperateInPerson)
                        PermissionRow(label: "RON acts", allowed: snapshot.canOperateRON)
                    }
                    .notaryCard()
                    .frame(width: 250)
                }
                .notaryCard()

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 210), spacing: 16)], spacing: 16) {
                    MetricTile(title: "Course Status", value: snapshot.courseStatusLabel, detail: NotaryOSLogic.percentString(snapshot.courseProgress), tone: .active)
                    MetricTile(title: "Commission", value: NotaryOSLogic.percentString(snapshot.commissionProgress), detail: snapshot.canOperateInPerson ? "Ready for live work" : "Still in setup", tone: snapshot.canOperateInPerson ? .success : .warning)
                    MetricTile(title: "RON", value: NotaryOSLogic.percentString(snapshot.ronProgress), detail: snapshot.canOperateRON ? "Remote ready" : "Still blocked", tone: snapshot.canOperateRON ? .success : .neutral)
                    MetricTile(title: "Business Setup", value: NotaryOSLogic.percentString(snapshot.businessProgress), detail: "Entity, banking, insurance", tone: .neutral)
                    MetricTile(title: "Revenue Readiness", value: NotaryOSLogic.percentString(snapshot.revenueProgress), detail: snapshot.canOperateInPerson ? "Start closing clean jobs" : "Finish licensing first", tone: .active)
                }

                HStack(alignment: .top, spacing: 16) {
                    SummaryListCard(title: "Blockers", items: snapshot.blockers.isEmpty ? ["No active blockers. Stay consistent and keep moving."] : snapshot.blockers, tone: snapshot.blockers.isEmpty ? .success : .blocked)
                    SummaryListCard(title: "This week", items: snapshot.dueSoon.isEmpty ? ["No due-soon items yet."] : snapshot.dueSoon, tone: .warning)
                    SummaryListCard(title: "Milestones complete", items: completedMilestoneItems, tone: .neutral)
                }
            }
            .padding(24)
        }
    }

    private var completedMilestoneItems: [String] {
        let items = Array(milestones.filter(\.isComplete).map(\.title).prefix(5))
        return items.isEmpty ? ["None yet — start with the course packet."] : items
    }
}

struct CourseLibraryView: View {
    let documents: [CourseDocument]
    let progressRecords: [StudyProgress]
    let onOpen: (CourseDocument) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                SectionTitle(eyebrow: "Course Library", title: "Paid course materials live here.", subtitle: "Your Ohio notary packet is stored locally so you can study without depending on the Desktop file path.")

                ForEach(documents, id: \.id) { document in
                    let progress = progressRecords.first(where: { $0.documentID == document.id })
                    VStack(alignment: .leading, spacing: 14) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 8) {
                                Text(document.title)
                                    .font(.notarySerif(24, weight: .semibold))
                                Text("\(document.pageCount) pages • last opened \(NotaryOSLogic.formatDate(document.lastOpenedAt))")
                                    .font(.notarySerif(14))
                                    .foregroundStyle(NotaryPalette.walnut)
                            }
                            Spacer()
                            NotaryStatusBadge(label: label(for: document.documentStatus), tone: tone(for: document.documentStatus))
                        }

                        ProgressView(value: progress?.percentComplete ?? 0)
                            .tint(NotaryPalette.blue)
                        Text("Reading progress: \(NotaryOSLogic.percentString(progress?.percentComplete ?? 0))")
                            .font(.notarySerif(14))
                            .foregroundStyle(NotaryPalette.walnut)

                        HStack(spacing: 12) {
                            Button(progress == nil || (progress?.lastPageRead ?? 1) <= 1 ? "Open" : "Resume") {
                                onOpen(document)
                            }
                            .buttonStyle(PrimaryButtonStyle())
                        }
                    }
                    .notaryCard()
                }
            }
            .padding(24)
        }
    }

    private func label(for status: CourseDocumentStatus) -> String {
        switch status {
        case .notStarted: return "Not started"
        case .reading: return "Reading"
        case .reviewed: return "Reviewed"
        }
    }

    private func tone(for status: CourseDocumentStatus) -> NotaryStatusTone {
        switch status {
        case .notStarted: return .neutral
        case .reading: return .active
        case .reviewed: return .success
        }
    }
}

struct StudyProgressView: View {
    let documents: [CourseDocument]
    let progressRecords: [StudyProgress]
    let notes: [StudyNote]
    let bookmarks: [DocumentBookmark]
    let onResume: (CourseDocument) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                SectionTitle(eyebrow: "Study Progress", title: "Keep the packet moving.", subtitle: "This view shows what you have actually read, saved, and marked for review.")

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 200), spacing: 16)], spacing: 16) {
                    MetricTile(title: "Documents", value: "\(documents.count)", detail: "Local course library items", tone: .neutral)
                    MetricTile(title: "Bookmarks", value: "\(bookmarks.count)", detail: "Quick return anchors", tone: .active)
                    MetricTile(title: "Notes", value: "\(notes.count)", detail: "Study takeaways saved", tone: .warning)
                    MetricTile(title: "Average Progress", value: NotaryOSLogic.percentString(NotaryOSLogic.courseProgress(for: documents, progress: progressRecords)), detail: "Across all documents", tone: .success)
                }

                ForEach(documents, id: \.id) { document in
                    let progress = progressRecords.first(where: { $0.documentID == document.id })
                    let scopedBookmarks = bookmarks.filter { $0.documentID == document.id }
                    let scopedNotes = notes.filter { $0.documentID == document.id }
                    HStack(alignment: .top, spacing: 18) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(document.title)
                                .font(.notarySerif(22, weight: .semibold))
                            Text("Last page: \(progress?.lastPageRead ?? 1) • Last studied: \(NotaryOSLogic.formatDate(progress?.lastStudiedAt))")
                                .font(.notarySerif(14))
                                .foregroundStyle(NotaryPalette.walnut)
                            Text("\(scopedBookmarks.count) bookmarks • \(scopedNotes.count) notes")
                                .font(.notarySerif(14))
                                .foregroundStyle(NotaryPalette.walnut)
                        }
                        Spacer()
                        Button("Resume") { onResume(document) }
                            .buttonStyle(PrimaryButtonStyle())
                    }
                    .notaryCard()
                }
            }
            .padding(24)
        }
    }
}

struct LicensingChecklistView: View {
    let milestones: [LaunchMilestone]
    let tasks: [LaunchTask]
    let onToggleTask: (LaunchTask) -> Void
    let onSaveNotes: (LaunchMilestone, String) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                SectionTitle(eyebrow: "Licensing Checklist", title: "Work the steps in order.", subtitle: "Complete each task to unlock the next milestone. This is your launch checklist from paid course through first revenue.")

                ForEach(LaunchPhaseCategory.allCases, id: \.self) { phase in
                    let scopedMilestones = milestones.filter { $0.phaseCategory == phase }.sorted { $0.sortOrder < $1.sortOrder }
                    if !scopedMilestones.isEmpty {
                        VStack(alignment: .leading, spacing: 14) {
                            Text(phase.title)
                                .font(.notarySerif(22, weight: .semibold))
                                .foregroundStyle(NotaryPalette.ink)

                            ForEach(scopedMilestones, id: \.id) { milestone in
                                MilestoneCardView(
                                    milestone: milestone,
                                    tasks: NotaryOSLogic.tasks(for: milestone, in: tasks),
                                    status: NotaryOSLogic.milestoneStatus(for: milestone, milestones: milestones),
                                    onToggleTask: onToggleTask,
                                    onSaveNotes: onSaveNotes
                                )
                            }
                        }
                    }
                }
            }
            .padding(24)
        }
    }
}

struct StudySessionView: View {
    let document: CourseDocument
    let progress: StudyProgress?
    let notes: [StudyNote]
    let bookmarks: [DocumentBookmark]
    let onProgressUpdate: (CourseDocument, Int) -> Void
    let onAddNote: (CourseDocument, Int, String) -> Void
    let onAddBookmark: (CourseDocument, Int, String) -> Void
    let onMarkReviewed: (CourseDocument) -> Void
    let onBackToLibrary: () -> Void

    @State private var currentPage: Int = 1
    @State private var noteText = ""
    @State private var bookmarkLabel = ""

    var body: some View {
        HStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    Button("Back to Library", action: onBackToLibrary)
                        .buttonStyle(SecondaryButtonStyle())
                    Spacer()
                    Button("Mark Reviewed") {
                        onMarkReviewed(document)
                    }
                    .buttonStyle(PrimaryButtonStyle())
                }

                Text(document.title)
                    .font(.notarySerif(28, weight: .semibold))
                Text("Page \(currentPage) of \(max(document.pageCount, 1))")
                    .font(.notarySerif(14))
                    .foregroundStyle(NotaryPalette.walnut)

                let url = URL(fileURLWithPath: document.localPath)
                if FileManager.default.fileExists(atPath: url.path) {
                    PDFDocumentView(url: url, currentPageIndex: $currentPage)
                        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 18, style: .continuous)
                                .stroke(NotaryPalette.blue.opacity(0.14), lineWidth: 1)
                        )
                        .onChange(of: currentPage) { _, newValue in
                            onProgressUpdate(document, newValue)
                        }
                } else {
                    EmptyStateView(title: "Document missing", message: "The seeded course packet could not be opened.")
                }
            }
            .padding(24)
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            Divider()

            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    SectionTitle(eyebrow: "Study Notes", title: "Capture what matters.", subtitle: "Use short notes and bookmarks so the study packet becomes searchable and reusable.")

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Add note for page \(currentPage)")
                            .font(.notarySerif(16, weight: .semibold))
                        TextEditor(text: $noteText)
                            .font(.notarySerif(15))
                            .frame(minHeight: 100)
                            .padding(8)
                            .background(.white.opacity(0.8))
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                        Button("Save Note") {
                            onAddNote(document, currentPage, noteText)
                            noteText = ""
                        }
                        .buttonStyle(PrimaryButtonStyle())
                    }
                    .notaryCard()

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Bookmark current page")
                            .font(.notarySerif(16, weight: .semibold))
                        TextField("Example: Prohibited acts list", text: $bookmarkLabel)
                            .textFieldStyle(.roundedBorder)
                            .font(.notarySerif(15))
                        Button("Save Bookmark") {
                            onAddBookmark(document, currentPage, bookmarkLabel)
                            bookmarkLabel = ""
                        }
                        .buttonStyle(SecondaryButtonStyle())
                    }
                    .notaryCard()

                    SummaryListCard(title: "Bookmarks", items: bookmarks.map { "Page \($0.pageNumber): \($0.label)" }, tone: .active)
                    SummaryListCard(title: "Recent Notes", items: notes.prefix(6).map { "Page \($0.pageNumber): \($0.noteText)" }, tone: .neutral)
                }
                .padding(24)
            }
            .frame(width: 360)
        }
        .onAppear {
            currentPage = progress?.lastPageRead ?? 1
        }
    }
}

struct OperationsView: View {
    let config: NotaryAppConfig?
    @State private var refreshID = UUID()

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            SectionTitle(eyebrow: "Operations", title: "Run the live business app inside the Mac shell.", subtitle: "The native app handles study + launch. Your deployed Notary OS handles bookings, analytics, and revenue ops.")

            if let url = resolvedURL {
                HStack(spacing: 12) {
                    Text(url.absoluteString)
                        .font(.notarySerif(14))
                        .foregroundStyle(NotaryPalette.walnut)
                        .lineLimit(1)
                    Spacer()
                    Button("Reload") { refreshID = UUID() }
                        .buttonStyle(SecondaryButtonStyle())
                }
                .notaryCard()

                OperationsWebContainer(url: url)
                    .id(refreshID)
                    .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                    .padding(.horizontal, 24)
                    .padding(.bottom, 24)
            } else {
                ErrorStateView(title: "Invalid operations URL", message: "Check Settings and confirm the production or custom dashboard URL is valid.")
                    .padding(24)
            }
        }
        .padding(.horizontal, 24)
        .padding(.top, 24)
    }

    private var resolvedURL: URL? {
        let raw = config?.useProductionURL == false ? (config?.webBaseURL ?? AppBootstrapper.productionOperationsURL) : AppBootstrapper.productionOperationsURL
        return URL(string: raw)
    }
}

struct SettingsView: View {
    @Bindable var config: NotaryAppConfig
    let onSave: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                SectionTitle(eyebrow: "Settings", title: "Control the shell behavior.", subtitle: "Use production by default, or switch to a local/dev URL when you are testing the web app.")

                VStack(alignment: .leading, spacing: 16) {
                    Toggle("Use deployed production operations URL", isOn: $config.useProductionURL)
                        .font(.notarySerif(16))
                    TextField("Custom web app URL", text: $config.webBaseURL)
                        .textFieldStyle(.roundedBorder)
                        .font(.notarySerif(15))
                        .disabled(config.useProductionURL)
                    Toggle("Course already paid", isOn: $config.coursePaid)
                        .font(.notarySerif(16))
                    Toggle("Onboarding complete", isOn: $config.onboardingCompleted)
                        .font(.notarySerif(16))
                    Button("Save Settings", action: onSave)
                        .buttonStyle(PrimaryButtonStyle())
                }
                .notaryCard()
            }
            .padding(24)
        }
    }
}

struct MilestoneCardView: View {
    let milestone: LaunchMilestone
    let tasks: [LaunchTask]
    let status: MilestoneVisualStatus
    let onToggleTask: (LaunchTask) -> Void
    let onSaveNotes: (LaunchMilestone, String) -> Void

    @State private var notesDraft = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 8) {
                    Text(milestone.title)
                        .font(.notarySerif(20, weight: .semibold))
                    Text(milestone.details)
                        .font(.notarySerif(14))
                        .foregroundStyle(NotaryPalette.walnut)
                    if let dueLabel = milestone.dueLabel {
                        Text("Due: \(dueLabel)")
                            .font(.notarySerif(13))
                            .foregroundStyle(NotaryPalette.blue)
                    }
                    if status == .blocked, let blockerReason = milestone.blockerReason {
                        Text(blockerReason)
                            .font(.notarySerif(13))
                            .foregroundStyle(NotaryPalette.rust)
                    }
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 8) {
                    NotaryStatusBadge(label: status.label, tone: status.tone)
                    if milestone.sourceType == .derived {
                        NotaryStatusBadge(label: "Auto", tone: .neutral)
                    }
                }
            }

            ForEach(tasks, id: \.id) { task in
                Button {
                    onToggleTask(task)
                } label: {
                    HStack {
                        Image(systemName: task.isComplete ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(task.isComplete ? NotaryPalette.teal : NotaryPalette.walnut)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(task.title)
                                .font(.notarySerif(15))
                                .foregroundStyle(NotaryPalette.ink)
                            if let evidenceValue = task.evidenceValue, !evidenceValue.isEmpty {
                                Text(evidenceValue)
                                    .font(.notarySerif(12))
                                    .foregroundStyle(NotaryPalette.walnut)
                            }
                        }
                        Spacer()
                    }
                }
                .buttonStyle(.plain)
                .padding(10)
                .background(NotaryPalette.backgroundTop.opacity(0.8))
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Owner notes")
                    .font(.notarySerif(14, weight: .semibold))
                TextField("What still needs attention?", text: $notesDraft, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
                    .font(.notarySerif(14))
                    .onAppear {
                        notesDraft = milestone.ownerNotes ?? ""
                    }
                    .onChange(of: milestone.id) { _, _ in
                        notesDraft = milestone.ownerNotes ?? ""
                    }
                Button("Save Notes") {
                    onSaveNotes(milestone, notesDraft)
                }
                .buttonStyle(SecondaryButtonStyle())
            }
        }
        .notaryCard()
    }
}

struct PermissionRow: View {
    let label: String
    let allowed: Bool

    var body: some View {
        HStack {
            Image(systemName: allowed ? "checkmark.shield.fill" : "xmark.shield")
                .foregroundStyle(allowed ? NotaryPalette.teal : NotaryPalette.rust)
            Text(label)
                .font(.notarySerif(15))
            Spacer()
            Text(allowed ? "Allowed" : "Blocked")
                .font(.notarySerif(13, weight: .semibold))
                .foregroundStyle(allowed ? NotaryPalette.teal : NotaryPalette.rust)
        }
    }
}

struct MetricTile: View {
    let title: String
    let value: String
    let detail: String
    let tone: NotaryStatusTone

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.notarySerif(13, weight: .semibold))
                .tracking(0.8)
                .textCase(.uppercase)
                .foregroundStyle(NotaryPalette.walnut)
            Text(value)
                .font(.notarySerif(28, weight: .semibold))
                .foregroundStyle(NotaryPalette.ink)
            Text(detail)
                .font(.notarySerif(14))
                .foregroundStyle(NotaryPalette.walnut)
            NotaryStatusBadge(label: title, tone: tone)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .notaryCard()
    }
}

struct SummaryListCard: View {
    let title: String
    let items: [String]
    let tone: NotaryStatusTone

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(title)
                    .font(.notarySerif(18, weight: .semibold))
                Spacer()
                NotaryStatusBadge(label: title, tone: tone)
            }
            ForEach(items, id: \.self) { item in
                HStack(alignment: .top, spacing: 8) {
                    Circle()
                        .fill(tone.foreground)
                        .frame(width: 6, height: 6)
                        .padding(.top, 7)
                    Text(item)
                        .font(.notarySerif(14))
                        .foregroundStyle(NotaryPalette.walnut)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .notaryCard()
    }
}

struct EmptyStateView: View {
    let title: String
    let message: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "rectangle.stack.person.crop")
                .font(.system(size: 32))
                .foregroundStyle(NotaryPalette.blue)
            Text(title)
                .font(.notarySerif(22, weight: .semibold))
            Text(message)
                .font(.notarySerif(15))
                .foregroundStyle(NotaryPalette.walnut)
                .multilineTextAlignment(.center)
        }
        .padding(32)
        .notaryCard()
    }
}

struct ErrorStateView: View {
    let title: String
    let message: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 34))
                .foregroundStyle(NotaryPalette.rust)
            Text(title)
                .font(.notarySerif(22, weight: .semibold))
            Text(message)
                .font(.notarySerif(15))
                .foregroundStyle(NotaryPalette.walnut)
                .multilineTextAlignment(.center)
        }
        .padding(32)
        .notaryCard()
    }
}
