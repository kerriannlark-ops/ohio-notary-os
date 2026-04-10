import SwiftData
import SwiftUI

struct RootShellView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \CourseDocument.createdAt) private var documents: [CourseDocument]
    @Query(sort: \StudyNote.createdAt, order: .reverse) private var notes: [StudyNote]
    @Query(sort: \DocumentBookmark.createdAt, order: .reverse) private var bookmarks: [DocumentBookmark]
    @Query(sort: \StudyModule.sortOrder) private var modules: [StudyModule]
    @Query(sort: \StudyRule.sortOrder) private var rules: [StudyRule]
    @Query(sort: \Flashcard.sortOrder) private var flashcards: [Flashcard]
    @Query(sort: \PracticeQuestion.sortOrder) private var questions: [PracticeQuestion]
    @Query(sort: \QuizAttempt.finishedAt, order: .reverse) private var attempts: [QuizAttempt]
    @Query(sort: \TopicMastery.moduleID) private var masteryRecords: [TopicMastery]
    @Query(sort: \CramSheet.generatedAt, order: .reverse) private var cramSheets: [CramSheet]
    @Query(sort: \LaunchMilestone.sortOrder) private var milestones: [LaunchMilestone]
    @Query(sort: \LaunchTask.title) private var tasks: [LaunchTask]
    @Query private var configs: [NotaryAppConfig]
    @Query(sort: \StudyProgress.documentID) private var progressRecords: [StudyProgress]

    @State private var selection: AppSection? = .startHere
    @State private var selectedDocumentID: String?
    @State private var selectedStudyTab: StudyWorkspaceTab = .reader
    @State private var bootstrapError: String?
    @State private var bootstrapped = false

    var body: some View {
        NavigationSplitView {
            List(AppSection.sidebarCases, id: \.self, selection: $selection) { section in
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
        let snapshot = NotaryOSLogic.readinessSnapshot(
            documents: documents,
            progress: progressRecords,
            milestones: milestones,
            modules: modules,
            flashcards: flashcards,
            questions: questions,
            attempts: attempts,
            mastery: masteryRecords
        )
        let studySnapshot = NotaryOSLogic.studyDashboardSnapshot(modules: modules, flashcards: flashcards, questions: questions, mastery: masteryRecords, attempts: attempts)
        let config = configs.first
        let activeDocument = documents.first(where: { $0.id == selectedDocumentID }) ?? documents.first

        switch selection ?? .startHere {
        case .startHere:
            HomeView(
                snapshot: snapshot,
                milestones: milestones,
                onResumeStudy: {
                    selectedDocumentID = snapshot.recommendedDocumentID ?? documents.first?.id
                    selectedStudyTab = .reader
                    selection = .studySession
                },
                onStartQuiz: {
                    selectedDocumentID = snapshot.recommendedDocumentID ?? documents.first?.id
                    selectedStudyTab = .quiz
                    selection = .studySession
                },
                onOpenCram: {
                    selectedDocumentID = snapshot.recommendedDocumentID ?? documents.first?.id
                    selectedStudyTab = .cram
                    selection = .studySession
                },
                onOpenOperations: { selection = .operations }
            )
        case .courseLibrary:
            CourseLibraryView(
                documents: documents,
                progressRecords: progressRecords,
                modules: modules,
                questions: questions,
                onOpen: openDocument
            )
        case .studyProgress:
            StudyProgressView(
                documents: documents,
                progressRecords: progressRecords,
                notes: notes,
                bookmarks: bookmarks,
                modules: modules,
                masteryRecords: masteryRecords,
                attempts: attempts,
                onResume: openDocument
            )
        case .licensingChecklist:
            LicensingChecklistView(
                milestones: milestones,
                tasks: tasks,
                modules: modules,
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
                let documentModuleIDs = Set(modules.filter { $0.documentID == activeDocument.id }.map(\.id))
                StudySessionView(
                    document: activeDocument,
                    progress: progressRecords.first(where: { $0.documentID == activeDocument.id }),
                    notes: notes.filter { $0.documentID == activeDocument.id },
                    bookmarks: bookmarks.filter { $0.documentID == activeDocument.id },
                    modules: modules.filter { $0.documentID == activeDocument.id },
                    rules: rules.filter { documentModuleIDs.contains($0.moduleID) },
                    flashcards: flashcards.filter { documentModuleIDs.contains($0.moduleID) },
                    questions: questions.filter { documentModuleIDs.contains($0.moduleID) },
                    attempts: attempts,
                    masteryRecords: masteryRecords.filter { documentModuleIDs.contains($0.moduleID) },
                    cramSheet: cramSheets.first(where: { $0.documentID == activeDocument.id }),
                    selectedTab: $selectedStudyTab,
                    onProgressUpdate: updateProgress,
                    onAddNote: addNote,
                    onAddBookmark: addBookmark,
                    onMarkReviewed: markReviewed,
                    onReviewFlashcard: reviewFlashcard,
                    onSaveQuizAttempt: saveQuizAttempt,
                    onBackToLibrary: { selection = .courseLibrary }
                )
            } else {
                EmptyStateView(title: "No course packet found", message: "The study library has not been initialized yet.")
            }
        }
    }

    private func openDocument(_ document: CourseDocument, _ tab: StudyWorkspaceTab) {
        selectedDocumentID = document.id
        selectedStudyTab = tab
        selection = .studySession
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

    private func reviewFlashcard(_ card: Flashcard, isHard: Bool) {
        card.isHard = isHard
        card.lastReviewedAt = Date()
        let mastery = masteryRecords.first(where: { $0.moduleID == card.moduleID }) ?? {
            let created = TopicMastery(moduleID: card.moduleID)
            modelContext.insert(created)
            return created
        }()
        mastery.lastReviewedAt = Date()
        mastery.confidenceScore = min(1, max(0, mastery.confidenceScore + (isHard ? -0.08 : 0.06)))
        saveContext()
    }

    private func saveQuizAttempt(_ result: QuizResult, moduleIDs: [String], mode: QuizMode, startedAt: Date) {
        let attempt = QuizAttempt(
            startedAt: startedAt,
            finishedAt: Date(),
            scorePercent: result.scorePercent,
            totalQuestions: result.totalQuestions,
            moduleScope: moduleIDs,
            incorrectQuestionIDs: result.incorrectQuestionIDs,
            quizMode: mode
        )
        modelContext.insert(attempt)

        for moduleID in moduleIDs {
            let mastery = masteryRecords.first(where: { $0.moduleID == moduleID }) ?? {
                let created = TopicMastery(moduleID: moduleID)
                modelContext.insert(created)
                return created
            }()
            if let moduleScore = result.moduleScores[moduleID] {
                mastery.lastQuizScore = moduleScore
                let blended = (mastery.confidenceScore * 0.45) + ((moduleScore / 100) * 0.55)
                mastery.confidenceScore = min(1, max(0, blended))
            }
            mastery.lastReviewedAt = Date()
        }
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
    let onStartQuiz: () -> Void
    let onOpenCram: () -> Void
    let onOpenOperations: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                SectionTitle(
                    eyebrow: "Start Here",
                    title: "Study to pass, then launch to revenue.",
                    subtitle: "This is your private Ohio notary study + launch hub. Use it to finish the packet, pass the course, and then execute the licensing steps in order."
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
                            Button("Start Practice Quiz", action: onStartQuiz)
                                .buttonStyle(SecondaryButtonStyle())
                            Button("Open Cram Sheet", action: onOpenCram)
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
                    MetricTile(title: "Latest Quiz", value: snapshot.latestQuizScoreLabel, detail: snapshot.passTargetLabel, tone: snapshot.latestQuizScoreLabel == "No quiz yet" ? .neutral : .active)
                    MetricTile(title: "Best Quiz", value: snapshot.bestQuizScoreLabel, detail: "Target: 80%+", tone: snapshot.bestQuizScoreLabel == "No score yet" ? .neutral : .success)
                    MetricTile(title: "Flashcards Due", value: "\(snapshot.flashcardsDueCount)", detail: "Hit hard cards first", tone: .warning)
                    MetricTile(title: "Module Coverage", value: "\(snapshot.moduleCoverageCount)", detail: "Packet study modules", tone: .neutral)
                    MetricTile(title: "Sample Qs", value: "\(studySnapshot.sampleQuestionCount)", detail: "Pulled from packet", tone: .active)
                    MetricTile(title: "Commission", value: NotaryOSLogic.percentString(snapshot.commissionProgress), detail: snapshot.canOperateInPerson ? "Ready for live work" : "Still in setup", tone: snapshot.canOperateInPerson ? .success : .warning)
                }

                HStack(alignment: .top, spacing: 16) {
                    SummaryListCard(title: "Weak Topics", items: snapshot.weakTopics.isEmpty ? ["No weak topics identified yet. Take a quiz to surface them."] : snapshot.weakTopics, tone: .warning)
                    SummaryListCard(title: "Blockers", items: snapshot.blockers.isEmpty ? ["No active blockers. Stay consistent and keep moving."] : snapshot.blockers, tone: snapshot.blockers.isEmpty ? .success : .blocked)
                    SummaryListCard(title: "This Week", items: snapshot.dueSoon.isEmpty ? ["No due-soon items yet."] : snapshot.dueSoon, tone: .active)
                }

                HStack(alignment: .top, spacing: 16) {
                    SummaryListCard(title: "Milestones Complete", items: completedMilestoneItems, tone: .neutral)
                    SummaryListCard(title: "Pass Strategy", items: [
                        "Know the fee caps exactly.",
                        "Know acknowledgment vs jurat exactly.",
                        "Know personal appearance + ID rules exactly.",
                        "Never notarize incomplete title sections.",
                        "Memorize the core Do Not list."
                    ], tone: .active)
                    VStack(alignment: .leading, spacing: 12) {
                        Text("After you pass")
                            .font(.notarySerif(18, weight: .semibold))
                        Text("Use the Operations tab only after the licensing checklist says you are ready. The app keeps study, licensing, and launch in one place so you do not waste motion.")
                            .font(.notarySerif(14))
                            .foregroundStyle(NotaryPalette.walnut)
                        Button("Open Operations", action: onOpenOperations)
                            .buttonStyle(PrimaryButtonStyle())
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .notaryCard()
                }
            }
            .padding(24)
        }
    }

    private var completedMilestoneItems: [String] {
        let items = Array(milestones.filter(\.isComplete).map(\.title).prefix(5))
        return items.isEmpty ? ["None yet — start with the packet and the course exam."] : items
    }
}

struct CourseLibraryView: View {
    let documents: [CourseDocument]
    let progressRecords: [StudyProgress]
    let modules: [StudyModule]
    let questions: [PracticeQuestion]
    let onOpen: (CourseDocument, StudyWorkspaceTab) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                SectionTitle(
                    eyebrow: "Course Library",
                    title: "Your paid course materials live here.",
                    subtitle: "The seeded packet is stored locally and has already been broken into exam-focused modules, flashcards, quiz questions, and a cram sheet."
                )

                ForEach(documents, id: \.id) { document in
                    let progress = progressRecords.first(where: { $0.documentID == document.id })
                    let scopedModules = modules.filter { $0.documentID == document.id }
                    let scopedQuestions = questions.filter { scopedModules.map(\.id).contains($0.moduleID) }
                    VStack(alignment: .leading, spacing: 14) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 8) {
                                Text(document.title)
                                    .font(.notarySerif(24, weight: .semibold))
                                Text("\(document.pageCount) pages • \(scopedModules.count) modules • \(scopedQuestions.count) practice questions")
                                    .font(.notarySerif(14))
                                    .foregroundStyle(NotaryPalette.walnut)
                                Text("Last opened \(NotaryOSLogic.formatDate(document.lastOpenedAt))")
                                    .font(.notarySerif(14))
                                    .foregroundStyle(NotaryPalette.walnut)
                            }
                            Spacer()
                            NotaryStatusBadge(label: label(for: document.documentStatus), tone: tone(for: document.documentStatus))
                        }

                        ProgressView(value: progress?.percentComplete ?? 0)
                            .tint(NotaryPalette.oxblood)
                        Text("Reading progress: \(NotaryOSLogic.percentString(progress?.percentComplete ?? 0))")
                            .font(.notarySerif(14))
                            .foregroundStyle(NotaryPalette.walnut)

                        HStack(spacing: 12) {
                            Button(progress == nil || (progress?.lastPageRead ?? 1) <= 1 ? "Open PDF" : "Resume") {
                                onOpen(document, .reader)
                            }
                            .buttonStyle(PrimaryButtonStyle())
                            Button("Outline") { onOpen(document, .outline) }
                                .buttonStyle(SecondaryButtonStyle())
                            Button("Flashcards") { onOpen(document, .flashcards) }
                                .buttonStyle(SecondaryButtonStyle())
                            Button("Quiz") { onOpen(document, .quiz) }
                                .buttonStyle(SecondaryButtonStyle())
                            Button("Cram Sheet") { onOpen(document, .cram) }
                                .buttonStyle(SecondaryButtonStyle())
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
    let modules: [StudyModule]
    let masteryRecords: [TopicMastery]
    let attempts: [QuizAttempt]
    let onResume: (CourseDocument, StudyWorkspaceTab) -> Void

    var body: some View {
        let weak = NotaryOSLogic.weakTopics(modules: modules, mastery: masteryRecords)
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                SectionTitle(eyebrow: "Study Progress", title: "Track what will actually move your score.", subtitle: "Use this view to spot weak topics, see how much of the packet you have covered, and jump back into the right study mode fast.")

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 200), spacing: 16)], spacing: 16) {
                    MetricTile(title: "Documents", value: "\(documents.count)", detail: "Local course library items", tone: .neutral)
                    MetricTile(title: "Modules", value: "\(modules.count)", detail: "Packet modules created", tone: .active)
                    MetricTile(title: "Latest Score", value: NotaryOSLogic.latestQuizScoreLabel(attempts: attempts), detail: "Most recent practice", tone: .active)
                    MetricTile(title: "Best Score", value: NotaryOSLogic.bestQuizScoreLabel(attempts: attempts), detail: "Target is 80%+", tone: .success)
                    MetricTile(title: "Bookmarks", value: "\(bookmarks.count)", detail: "Quick return anchors", tone: .active)
                    MetricTile(title: "Notes", value: "\(notes.count)", detail: "Study takeaways saved", tone: .warning)
                }

                HStack(alignment: .top, spacing: 16) {
                    SummaryListCard(title: "Weak Topics", items: weak.isEmpty ? ["No weak topics yet — take a quiz to surface them."] : weak, tone: .warning)
                    SummaryListCard(title: "Recent Activity", items: recentAttemptItems, tone: .neutral)
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
                        HStack(spacing: 10) {
                            Button("Resume PDF") { onResume(document, .reader) }
                                .buttonStyle(PrimaryButtonStyle())
                            Button("Quiz") { onResume(document, .quiz) }
                                .buttonStyle(SecondaryButtonStyle())
                        }
                    }
                    .notaryCard()
                }
            }
            .padding(24)
        }
    }

    private var recentAttemptItems: [String] {
        let items = attempts.prefix(4).map {
            "\(Int($0.scorePercent.rounded()))% on \(NotaryOSLogic.formatDate($0.finishedAt))"
        }
        return items.isEmpty ? ["No quiz attempts saved yet."] : items
    }
}

struct LicensingChecklistView: View {
    let milestones: [LaunchMilestone]
    let tasks: [LaunchTask]
    let modules: [StudyModule]
    let onToggleTask: (LaunchTask) -> Void
    let onSaveNotes: (LaunchMilestone, String) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                SectionTitle(eyebrow: "Licensing Checklist", title: "Work the steps in order.", subtitle: "Complete each task to unlock the next milestone. Use the study modules to pass the course first, then move into filing, oath, and launch setup.")

                SummaryListCard(title: "Best Study Modules First", items: recommendedModules, tone: .active)

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

    private var recommendedModules: [String] {
        let titles = modules.prefix(5).map { "\($0.title) (\($0.pageRangeLabel))" }
        return titles.isEmpty ? ["Seeded modules will appear after bootstrap."] : titles
    }
}

struct StudySessionView: View {
    let document: CourseDocument
    let progress: StudyProgress?
    let notes: [StudyNote]
    let bookmarks: [DocumentBookmark]
    let modules: [StudyModule]
    let rules: [StudyRule]
    let flashcards: [Flashcard]
    let questions: [PracticeQuestion]
    let attempts: [QuizAttempt]
    let masteryRecords: [TopicMastery]
    let cramSheet: CramSheet?
    @Binding var selectedTab: StudyWorkspaceTab
    let onProgressUpdate: (CourseDocument, Int) -> Void
    let onAddNote: (CourseDocument, Int, String) -> Void
    let onAddBookmark: (CourseDocument, Int, String) -> Void
    let onMarkReviewed: (CourseDocument) -> Void
    let onReviewFlashcard: (Flashcard, Bool) -> Void
    let onSaveQuizAttempt: (QuizResult, [String], QuizMode, Date) -> Void
    let onBackToLibrary: () -> Void

    @State private var currentPage: Int = 1
    @State private var noteText = ""
    @State private var bookmarkLabel = ""

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 12) {
                Button("Back to Library", action: onBackToLibrary)
                    .buttonStyle(SecondaryButtonStyle())
                Picker("Workspace", selection: $selectedTab) {
                    ForEach(StudyWorkspaceTab.allCases, id: \.self) { tab in
                        Text(tab.title).tag(tab)
                    }
                }
                .pickerStyle(.segmented)
                Button("Mark Reviewed") { onMarkReviewed(document) }
                    .buttonStyle(PrimaryButtonStyle())
            }
            .padding(24)

            Divider()

            switch selectedTab {
            case .reader:
                ReaderWorkspaceView(
                    document: document,
                    progress: progress,
                    notes: notes,
                    bookmarks: bookmarks,
                    modules: modules,
                    currentPage: $currentPage,
                    noteText: $noteText,
                    bookmarkLabel: $bookmarkLabel,
                    onProgressUpdate: onProgressUpdate,
                    onAddNote: onAddNote,
                    onAddBookmark: onAddBookmark
                )
            case .outline:
                OutlineWorkspaceView(
                    modules: modules,
                    rules: rules,
                    masteryRecords: masteryRecords,
                    onJumpToPage: { page in
                        currentPage = page
                        selectedTab = .reader
                    }
                )
            case .flashcards:
                FlashcardWorkspaceView(
                    modules: modules,
                    flashcards: flashcards,
                    onReviewFlashcard: onReviewFlashcard
                )
            case .quiz:
                QuizWorkspaceView(
                    modules: modules,
                    questions: questions,
                    onSaveQuizAttempt: onSaveQuizAttempt
                )
            case .cram:
                CramWorkspaceView(
                    cramSheet: cramSheet,
                    weakTopics: NotaryOSLogic.weakTopics(modules: modules, mastery: masteryRecords),
                    latestScore: NotaryOSLogic.latestQuizScoreLabel(attempts: attempts)
                )
            }
        }
        .onAppear {
            currentPage = progress?.lastPageRead ?? 1
        }
    }
}

struct ReaderWorkspaceView: View {
    let document: CourseDocument
    let progress: StudyProgress?
    let notes: [StudyNote]
    let bookmarks: [DocumentBookmark]
    let modules: [StudyModule]
    @Binding var currentPage: Int
    @Binding var noteText: String
    @Binding var bookmarkLabel: String
    let onProgressUpdate: (CourseDocument, Int) -> Void
    let onAddNote: (CourseDocument, Int, String) -> Void
    let onAddBookmark: (CourseDocument, Int, String) -> Void

    var body: some View {
        HStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 16) {
                Text(document.title)
                    .font(.notarySerif(28, weight: .semibold))
                Text("Page \(currentPage) of \(max(document.pageCount, 1))")
                    .font(.notarySerif(14))
                    .foregroundStyle(NotaryPalette.walnut)

                if !currentModules.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(currentModules, id: \.id) { module in
                                Text(module.title)
                                    .font(.notarySerif(13, weight: .semibold))
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(NotaryPalette.roseDust)
                                    .clipShape(Capsule())
                            }
                        }
                    }
                }

                let url = URL(fileURLWithPath: document.localPath)
                if FileManager.default.fileExists(atPath: url.path) {
                    PDFDocumentView(url: url, currentPageIndex: $currentPage)
                        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 18, style: .continuous)
                                .stroke(NotaryPalette.oxblood.opacity(0.14), lineWidth: 1)
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
                    SectionTitle(eyebrow: "Reader Tools", title: "Capture what matters.", subtitle: "Use short notes and bookmarks so your paid packet becomes searchable, actionable, and reusable.")

                    SummaryListCard(title: "Current Page Focus", items: currentModules.isEmpty ? ["No mapped module for this page."] : currentModules.map { "\($0.title) • \($0.pageRangeLabel)" }, tone: .active)

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
                        TextField("Example: Jurat steps", text: $bookmarkLabel)
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
    }

    private var currentModules: [StudyModule] {
        NotaryOSLogic.module(for: currentPage, in: modules)
    }
}

struct OutlineWorkspaceView: View {
    let modules: [StudyModule]
    let rules: [StudyRule]
    let masteryRecords: [TopicMastery]
    let onJumpToPage: (Int) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                SectionTitle(eyebrow: "Outline", title: "Study the packet by topic, not by overwhelm.", subtitle: "Each module below includes high-priority rules, what people miss, and the packet pages to revisit.")

                ForEach(modules.sorted { $0.sortOrder < $1.sortOrder }, id: \.id) { module in
                    let moduleRules = rules.filter { $0.moduleID == module.id }.sorted { $0.sortOrder < $1.sortOrder }
                    let mastery = masteryRecords.first(where: { $0.moduleID == module.id })
                    VStack(alignment: .leading, spacing: 14) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 8) {
                                Text(module.title)
                                    .font(.notarySerif(22, weight: .semibold))
                                Text(module.summary)
                                    .font(.notarySerif(14))
                                    .foregroundStyle(NotaryPalette.walnut)
                                Text("Source: \(module.pageRangeLabel)")
                                    .font(.notarySerif(13))
                                    .foregroundStyle(NotaryPalette.oxblood)
                            }
                            Spacer()
                            VStack(alignment: .trailing, spacing: 8) {
                                NotaryStatusBadge(label: "Exam wt \(Int(module.examWeight))", tone: .active)
                                if let mastery {
                                    NotaryStatusBadge(label: "\(Int(mastery.lastQuizScore.rounded()))%", tone: mastery.lastQuizScore >= 80 ? .success : .warning)
                                }
                            }
                        }

                        ModuleTagCloud(tags: module.keyTerms)

                        VStack(alignment: .leading, spacing: 6) {
                            Text("Must know")
                                .font(.notarySerif(15, weight: .semibold))
                            ForEach(moduleRules.filter(\.isHighPriority), id: \.id) { rule in
                                RuleRow(ruleText: rule.ruleText, pageRef: rule.sourcePages, tone: .active)
                            }
                        }

                        VStack(alignment: .leading, spacing: 6) {
                            Text("Checklist")
                                .font(.notarySerif(15, weight: .semibold))
                            ForEach(module.checklistBullets, id: \.self) { item in
                                BulletRow(text: item, color: NotaryPalette.oxblood)
                            }
                        }

                        VStack(alignment: .leading, spacing: 6) {
                            Text("Common mistakes")
                                .font(.notarySerif(15, weight: .semibold))
                            ForEach(module.commonMistakes, id: \.self) { item in
                                BulletRow(text: item, color: NotaryPalette.deepRed)
                            }
                        }

                        Button("Jump to packet page \(module.sourcePageStart)") {
                            onJumpToPage(module.sourcePageStart)
                        }
                        .buttonStyle(SecondaryButtonStyle())
                    }
                    .notaryCard()
                }
            }
            .padding(24)
        }
    }
}

struct FlashcardWorkspaceView: View {
    let modules: [StudyModule]
    let flashcards: [Flashcard]
    let onReviewFlashcard: (Flashcard, Bool) -> Void

    @State private var selectedModuleID: String = "all"
    @State private var currentCardIndex = 0
    @State private var showAnswer = false

    var body: some View {
        let filteredCards = deck
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                SectionTitle(eyebrow: "Flashcards", title: "Drill the rules until recall feels easy.", subtitle: "Start with hard cards and the highest-value topics. Use Easy/Hard to shape what comes back to you later.")

                HStack(spacing: 12) {
                    Picker("Module", selection: $selectedModuleID) {
                        Text("All modules").tag("all")
                        ForEach(modules, id: \.id) { module in
                            Text(module.title).tag(module.id)
                        }
                    }
                    .pickerStyle(.menu)
                    Spacer()
                    Text(filteredCards.isEmpty ? "0 cards" : "Card \(currentCardIndex + 1) of \(filteredCards.count)")
                        .font(.notarySerif(14))
                        .foregroundStyle(NotaryPalette.walnut)
                }
                .notaryCard()

                if let card = filteredCards[safe: currentCardIndex] {
                    VStack(alignment: .leading, spacing: 18) {
                        NotaryStatusBadge(label: card.difficulty == .core ? "Core" : "Challenge", tone: card.isHard ? .warning : .active)
                        Text(card.prompt)
                            .font(.notarySerif(26, weight: .semibold))
                            .foregroundStyle(NotaryPalette.ink)
                        if showAnswer {
                            Text(card.answer)
                                .font(.notarySerif(18))
                                .foregroundStyle(NotaryPalette.walnut)
                            Text("Source pages: \(card.sourcePages)")
                                .font(.notarySerif(13))
                                .foregroundStyle(NotaryPalette.oxblood)
                        } else {
                            Text("Pause. Answer it out loud before you reveal the card.")
                                .font(.notarySerif(16))
                                .foregroundStyle(NotaryPalette.walnut)
                        }

                        HStack(spacing: 12) {
                            Button(showAnswer ? "Hide Answer" : "Show Answer") { showAnswer.toggle() }
                                .buttonStyle(PrimaryButtonStyle())
                            Button("Easy") {
                                onReviewFlashcard(card, false)
                                advance(in: filteredCards)
                            }
                            .buttonStyle(SecondaryButtonStyle())
                            Button("Hard") {
                                onReviewFlashcard(card, true)
                                advance(in: filteredCards)
                            }
                            .buttonStyle(SecondaryButtonStyle())
                        }

                        HStack(spacing: 12) {
                            Button("Previous") {
                                currentCardIndex = max(0, currentCardIndex - 1)
                                showAnswer = false
                            }
                            .buttonStyle(SecondaryButtonStyle())
                            Button("Next") {
                                advance(in: filteredCards)
                            }
                            .buttonStyle(SecondaryButtonStyle())
                        }
                    }
                    .notaryCard()
                } else {
                    EmptyStateView(title: "No flashcards available", message: "Change the module filter or verify the seeded course content loaded correctly.")
                        .padding(.top, 24)
                }
            }
            .padding(24)
        }
        .onChange(of: selectedModuleID) { _, _ in
            currentCardIndex = 0
            showAnswer = false
        }
    }

    private var deck: [Flashcard] {
        let filtered = selectedModuleID == "all" ? flashcards : flashcards.filter { $0.moduleID == selectedModuleID }
        return filtered.sorted {
            if $0.isHard != $1.isHard { return $0.isHard && !$1.isHard }
            if $0.difficulty != $1.difficulty { return $0.difficulty == .core }
            return $0.sortOrder < $1.sortOrder
        }
    }

    private func advance(in cards: [Flashcard]) {
        guard !cards.isEmpty else { return }
        currentCardIndex = min(cards.count - 1, currentCardIndex + 1)
        showAnswer = false
    }
}

struct QuizWorkspaceView: View {
    let modules: [StudyModule]
    let questions: [PracticeQuestion]
    let onSaveQuizAttempt: (QuizResult, [String], QuizMode, Date) -> Void

    @State private var selectedModuleID: String = "all"
    @State private var activeQuestionIDs: [String] = []
    @State private var selectedAnswers: [String: Int] = [:]
    @State private var startedAt = Date()
    @State private var activeMode: QuizMode = .module
    @State private var submittedResult: QuizResult?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                SectionTitle(eyebrow: "Practice Quiz", title: "Test yourself before the real test tests you.", subtitle: "Use module mode for weak areas or start a timed 30-question exam to simulate the packet’s scoring target.")

                HStack(spacing: 12) {
                    Picker("Module", selection: $selectedModuleID) {
                        Text("All modules").tag("all")
                        ForEach(modules, id: \.id) { module in
                            Text(module.title).tag(module.id)
                        }
                    }
                    .pickerStyle(.menu)
                    Button("Start 30-Question Exam") { startFullExam() }
                        .buttonStyle(PrimaryButtonStyle())
                    Button("Start Module Quiz") { startModuleQuiz() }
                        .buttonStyle(SecondaryButtonStyle())
                    Spacer()
                    if !activeQuestions.isEmpty {
                        if activeMode == .fullExam {
                            CountdownView(startDate: startedAt, totalSeconds: 3600)
                        } else {
                            Text("Untimed module drill")
                                .font(.notarySerif(14))
                                .foregroundStyle(NotaryPalette.walnut)
                        }
                    }
                }
                .notaryCard()

                if activeQuestions.isEmpty {
                    EmptyStateView(title: "Choose a quiz mode", message: "Start the full 30-question exam or drill one module at a time.")
                } else {
                    ForEach(activeQuestions.indices, id: \.self) { index in
                        let question = activeQuestions[index]
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("Question \(index + 1)")
                                    .font(.notarySerif(15, weight: .semibold))
                                Spacer()
                                NotaryStatusBadge(label: moduleLabel(for: question.moduleID), tone: .neutral)
                            }
                            Text(question.question)
                                .font(.notarySerif(18, weight: .semibold))
                                .foregroundStyle(NotaryPalette.ink)

                            ForEach(Array(question.choices.enumerated()), id: \.offset) { choiceIndex, choice in
                                Button {
                                    selectedAnswers[question.id] = choiceIndex
                                } label: {
                                    QuizChoiceRow(
                                        label: "\(letter(for: choiceIndex)). \(choice)",
                                        isSelected: selectedAnswers[question.id] == choiceIndex
                                    )
                                }
                                .buttonStyle(.plain)
                            }

                            if let submittedResult, submittedResult.incorrectQuestionIDs.contains(question.id) {
                                Text("Correct answer: \(question.correctChoice) • \(question.explanation)")
                                    .font(.notarySerif(14))
                                    .foregroundStyle(NotaryPalette.deepRed)
                                Text("Source pages: \(question.sourcePages)")
                                    .font(.notarySerif(13))
                                    .foregroundStyle(NotaryPalette.oxblood)
                            }
                        }
                        .notaryCard()
                    }

                    HStack(spacing: 12) {
                        Button("Submit Quiz") { submitQuiz() }
                            .buttonStyle(PrimaryButtonStyle())
                        Button("Reset") { resetQuiz() }
                            .buttonStyle(SecondaryButtonStyle())
                    }

                    if let submittedResult {
                        let passed = submittedResult.scorePercent >= 80
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("Score: \(Int(submittedResult.scorePercent.rounded()))%")
                                    .font(.notarySerif(26, weight: .semibold))
                                Spacer()
                                NotaryStatusBadge(label: passed ? "Pass target" : "Needs review", tone: passed ? .success : .warning)
                            }
                            Text(passed ? "You are at or above the packet’s 80% passing target." : "Review the weak topics below, then retake the quiz before the live exam.")
                                .font(.notarySerif(15))
                                .foregroundStyle(NotaryPalette.walnut)
                            SummaryListCard(title: "Modules to review", items: missedModuleTitles(result: submittedResult), tone: .warning)
                        }
                        .notaryCard()
                    }
                }
            }
            .padding(24)
        }
    }

    private var activeQuestions: [PracticeQuestion] {
        let lookup = Dictionary(uniqueKeysWithValues: questions.map { ($0.id, $0) })
        return activeQuestionIDs.compactMap { lookup[$0] }
    }

    private func startFullExam() {
        activeMode = .fullExam
        startedAt = Date()
        selectedAnswers = [:]
        submittedResult = nil
        activeQuestionIDs = NotaryOSLogic.fullExamQuestions(from: questions).map(\.id)
    }

    private func startModuleQuiz() {
        activeMode = .module
        startedAt = Date()
        selectedAnswers = [:]
        submittedResult = nil
        let scoped = selectedModuleID == "all" ? questions : questions.filter { $0.moduleID == selectedModuleID }
        activeQuestionIDs = scoped.sorted { $0.sortOrder < $1.sortOrder }.map(\.id)
    }

    private func submitQuiz() {
        let result = NotaryOSLogic.gradeQuiz(questions: activeQuestions, answers: selectedAnswers)
        submittedResult = result
        let moduleIDs = Array(Set(activeQuestions.map(\.moduleID))).sorted()
        onSaveQuizAttempt(result, moduleIDs, activeMode, startedAt)
    }

    private func resetQuiz() {
        activeQuestionIDs = []
        selectedAnswers = [:]
        submittedResult = nil
    }

    private func missedModuleTitles(result: QuizResult) -> [String] {
        let low = result.moduleScores.filter { $0.value < 80 }.keys
        let titles = modules.filter { low.contains($0.id) }.map(\.title)
        return titles.isEmpty ? ["No weak modules — keep the score consistent."] : titles
    }

    private func moduleLabel(for id: String) -> String {
        modules.first(where: { $0.id == id })?.title ?? "Module"
    }

    private func letter(for index: Int) -> String {
        ["A", "B", "C", "D", "E"][safe: index] ?? "?"
    }
}

struct CramWorkspaceView: View {
    let cramSheet: CramSheet?
    let weakTopics: [String]
    let latestScore: String

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                SectionTitle(eyebrow: "Cram", title: "Final review before the exam.", subtitle: "This is your compressed pass-focused sheet. Use it after you have read the packet and taken at least one practice quiz.")

                HStack(alignment: .top, spacing: 16) {
                    SummaryListCard(title: "Latest Score", items: [latestScore], tone: .active)
                    SummaryListCard(title: "Weak Topics", items: weakTopics.isEmpty ? ["No weak topics identified yet."] : weakTopics, tone: .warning)
                }

                if let cramSheet {
                    VStack(alignment: .leading, spacing: 10) {
                        Text(cramSheet.title)
                            .font(.notarySerif(24, weight: .semibold))
                        ForEach(cramSheet.contentMarkdown.split(separator: "\n").map(String.init), id: \.self) { line in
                            CramLineView(line: line)
                        }
                    }
                    .notaryCard()
                } else {
                    EmptyStateView(title: "Cram sheet unavailable", message: "The seeded cram sheet has not loaded yet.")
                }
            }
            .padding(24)
        }
    }
}

struct OperationsView: View {
    let config: NotaryAppConfig?
    @State private var refreshID = UUID()

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            SectionTitle(eyebrow: "Operations", title: "Run the live business app inside the Mac shell.", subtitle: "The native app handles private study + launch. Your deployed Notary OS handles bookings, analytics, and revenue ops.")

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
                    Text("Private course materials remain inside the macOS app only.")
                        .font(.notarySerif(14))
                        .foregroundStyle(NotaryPalette.walnut)
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
                            .foregroundStyle(NotaryPalette.oxblood)
                    }
                    if status == .blocked, let blockerReason = milestone.blockerReason {
                        Text(blockerReason)
                            .font(.notarySerif(13))
                            .foregroundStyle(NotaryPalette.deepRed)
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
                            .foregroundStyle(task.isComplete ? Color(red: 54 / 255, green: 103 / 255, blue: 73 / 255) : NotaryPalette.walnut)
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
                    .onAppear { notesDraft = milestone.ownerNotes ?? "" }
                    .onChange(of: milestone.id) { _, _ in notesDraft = milestone.ownerNotes ?? "" }
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
                .foregroundStyle(allowed ? Color(red: 54 / 255, green: 103 / 255, blue: 73 / 255) : NotaryPalette.deepRed)
            Text(label)
                .font(.notarySerif(15))
            Spacer()
            Text(allowed ? "Allowed" : "Blocked")
                .font(.notarySerif(13, weight: .semibold))
                .foregroundStyle(allowed ? Color(red: 54 / 255, green: 103 / 255, blue: 73 / 255) : NotaryPalette.deepRed)
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
                BulletRow(text: item, color: tone.foreground)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .notaryCard()
    }
}

struct ModuleTagCloud: View {
    let tags: [String]

    var body: some View {
        FlexibleTagStack(tags: tags)
    }
}

struct FlexibleTagStack: View {
    let tags: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ForEach(chunked(tags, size: 3), id: \.self) { row in
                HStack(spacing: 8) {
                    ForEach(row, id: \.self) { tag in
                        Text(tag)
                            .font(.notarySerif(12, weight: .semibold))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(NotaryPalette.roseDust)
                            .clipShape(Capsule())
                    }
                    Spacer()
                }
            }
        }
    }

    private func chunked(_ items: [String], size: Int) -> [[String]] {
        stride(from: 0, to: items.count, by: size).map { index in
            Array(items[index ..< min(index + size, items.count)])
        }
    }
}

struct RuleRow: View {
    let ruleText: String
    let pageRef: String
    let tone: NotaryStatusTone

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            BulletRow(text: ruleText, color: tone.foreground)
            Text("Source: \(pageRef)")
                .font(.notarySerif(12))
                .foregroundStyle(NotaryPalette.oxblood)
                .padding(.leading, 14)
        }
    }
}

struct BulletRow: View {
    let text: String
    let color: Color

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Circle()
                .fill(color)
                .frame(width: 6, height: 6)
                .padding(.top, 7)
            Text(text)
                .font(.notarySerif(14))
                .foregroundStyle(NotaryPalette.walnut)
        }
    }
}

struct QuizChoiceRow: View {
    let label: String
    let isSelected: Bool

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: isSelected ? "largecircle.fill.circle" : "circle")
                .foregroundStyle(isSelected ? NotaryPalette.oxblood : NotaryPalette.walnut)
            Text(label)
                .font(.notarySerif(15))
                .foregroundStyle(NotaryPalette.ink)
            Spacer()
        }
        .padding(12)
        .background(isSelected ? NotaryPalette.roseDust : Color.white.opacity(0.8))
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(isSelected ? NotaryPalette.oxblood.opacity(0.2) : NotaryPalette.oxblood.opacity(0.08), lineWidth: 1)
        )
    }
}

struct CountdownView: View {
    let startDate: Date
    let totalSeconds: TimeInterval

    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { timeline in
            let elapsed = timeline.date.timeIntervalSince(startDate)
            let remaining = max(0, totalSeconds - elapsed)
            Text("Time left: \(format(remaining))")
                .font(.notarySerif(14, weight: .semibold))
                .foregroundStyle(remaining > 300 ? NotaryPalette.oxblood : NotaryPalette.deepRed)
        }
    }

    private func format(_ seconds: TimeInterval) -> String {
        let total = Int(seconds.rounded())
        let minutes = total / 60
        let secs = total % 60
        return String(format: "%02d:%02d", minutes, secs)
    }
}

struct CramLineView: View {
    let line: String

    var body: some View {
        if line.hasPrefix("# ") {
            Text(String(line.dropFirst(2)))
                .font(.notarySerif(24, weight: .semibold))
                .foregroundStyle(NotaryPalette.ink)
                .padding(.top, 8)
        } else if line.hasPrefix("## ") {
            Text(String(line.dropFirst(3)))
                .font(.notarySerif(18, weight: .semibold))
                .foregroundStyle(NotaryPalette.oxblood)
                .padding(.top, 8)
        } else if line.hasPrefix("- ") {
            BulletRow(text: String(line.dropFirst(2)), color: NotaryPalette.oxblood)
        } else if line.first?.isNumber == true {
            Text(line)
                .font(.notarySerif(14))
                .foregroundStyle(NotaryPalette.walnut)
                .padding(.leading, 4)
        } else if line.isEmpty {
            Color.clear.frame(height: 6)
        } else {
            Text(line)
                .font(.notarySerif(14))
                .foregroundStyle(NotaryPalette.walnut)
        }
    }
}

struct EmptyStateView: View {
    let title: String
    let message: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "rectangle.stack.person.crop")
                .font(.system(size: 32))
                .foregroundStyle(NotaryPalette.oxblood)
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
                .foregroundStyle(NotaryPalette.deepRed)
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

extension Array {
    subscript(safe index: Int) -> Element? {
        guard indices.contains(index) else { return nil }
        return self[index]
    }
}
