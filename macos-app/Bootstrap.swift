import Foundation
import PDFKit
import SwiftData

private let seededCourseID = "ohio-notary-course-packet"
private let seededCourseFileName = "OhioNotaryCoursePacket.pdf"
private let seededCourseContentFileName = "notary-course-content.json"

struct SeedMilestoneTemplate {
    let id: String
    let title: String
    let details: String
    let phase: LaunchPhaseCategory
    let sortOrder: Int
    let dueLabel: String?
    let blockerReason: String?
    let dependencyIDs: [String]
    let sourceType: LaunchSourceType
    let tasks: [(id: String, title: String, evidenceType: LaunchEvidenceType)]
}

enum AppBootstrapper {
    static let productionOperationsURL = "https://ohio-notary-os.netlify.app/dashboard"

    static func bootstrap(context: ModelContext) throws {
        try ensureConfig(context: context)
        try ensureSeededCourse(context: context)
        try ensureStudyContent(context: context)
        try ensureMilestones(context: context)
        try applyDerivedDefaults(context: context)
        try context.save()
    }

    static func applicationSupportDirectory() throws -> URL {
        let base = try FileManager.default.url(
            for: .applicationSupportDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: true
        )
        let directory = base.appendingPathComponent("NotaryOSStudyHub", isDirectory: true)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        return directory
    }

    static func seededCourseLocalURL() throws -> URL {
        try applicationSupportDirectory()
            .appendingPathComponent("SeededCourse", isDirectory: true)
            .appendingPathComponent(seededCourseFileName)
    }

    private static func seededCourseContentLocalURL() throws -> URL {
        try applicationSupportDirectory()
            .appendingPathComponent("SeededCourse", isDirectory: true)
            .appendingPathComponent(seededCourseContentFileName)
    }

    private static func ensureConfig(context: ModelContext) throws {
        let descriptor = FetchDescriptor<NotaryAppConfig>()
        if try context.fetch(descriptor).isEmpty {
            context.insert(NotaryAppConfig())
        }
    }

    private static func ensureSeededCourse(context: ModelContext) throws {
        let descriptor = FetchDescriptor<CourseDocument>(predicate: #Predicate { $0.id == seededCourseID })
        let existing = try context.fetch(descriptor).first

        let destinationDirectory = try applicationSupportDirectory().appendingPathComponent("SeededCourse", isDirectory: true)
        try FileManager.default.createDirectory(at: destinationDirectory, withIntermediateDirectories: true)
        let destinationPDF = destinationDirectory.appendingPathComponent(seededCourseFileName)
        let destinationJSON = destinationDirectory.appendingPathComponent(seededCourseContentFileName)

        if let sourceURL = Bundle.main.url(forResource: "OhioNotaryCoursePacket", withExtension: "pdf", subdirectory: "SeededCourse"),
           !FileManager.default.fileExists(atPath: destinationPDF.path) {
            try? FileManager.default.removeItem(at: destinationPDF)
            try FileManager.default.copyItem(at: sourceURL, to: destinationPDF)
        }

        if let sourceJSON = Bundle.main.url(forResource: "notary-course-content", withExtension: "json", subdirectory: "SeededCourse"),
           !FileManager.default.fileExists(atPath: destinationJSON.path) {
            try? FileManager.default.removeItem(at: destinationJSON)
            try FileManager.default.copyItem(at: sourceJSON, to: destinationJSON)
        }

        let pageCount = PDFDocument(url: destinationPDF)?.pageCount ?? 149

        if let existing {
            existing.localPath = destinationPDF.path
            existing.pageCount = pageCount
        } else {
            let document = CourseDocument(
                id: seededCourseID,
                title: "Ohio Notary Course Packet",
                fileName: seededCourseFileName,
                localPath: destinationPDF.path,
                sourceType: .seeded,
                status: .notStarted,
                pageCount: pageCount,
                lastOpenedAt: nil
            )
            context.insert(document)
            context.insert(StudyProgress(documentID: seededCourseID))
        }
    }

    private static func ensureStudyContent(context: ModelContext) throws {
        let payload = try loadSeededCourseContent()

        let modules = try context.fetch(FetchDescriptor<StudyModule>())
        let modulesByID = Dictionary(uniqueKeysWithValues: modules.map { ($0.id, $0) })
        let rules = try context.fetch(FetchDescriptor<StudyRule>())
        let rulesByID = Dictionary(uniqueKeysWithValues: rules.map { ($0.id, $0) })
        let flashcards = try context.fetch(FetchDescriptor<Flashcard>())
        let flashcardsByID = Dictionary(uniqueKeysWithValues: flashcards.map { ($0.id, $0) })
        let questions = try context.fetch(FetchDescriptor<PracticeQuestion>())
        let questionsByID = Dictionary(uniqueKeysWithValues: questions.map { ($0.id, $0) })
        let cramSheets = try context.fetch(FetchDescriptor<CramSheet>())
        let cramSheetsByID = Dictionary(uniqueKeysWithValues: cramSheets.map { ($0.id, $0) })
        let masteryRecords = try context.fetch(FetchDescriptor<TopicMastery>())
        let masteryByID = Dictionary(uniqueKeysWithValues: masteryRecords.map { ($0.id, $0) })

        var seededModuleIDs = Set<String>()
        var seededRuleIDs = Set<String>()
        var seededFlashcardIDs = Set<String>()
        var seededQuestionIDs = Set<String>()
        var seededCramIDs = Set<String>()

        for modulePayload in payload.modules {
            seededModuleIDs.insert(modulePayload.id)
            let module = modulesByID[modulePayload.id] ?? {
                let created = StudyModule(
                    id: modulePayload.id,
                    documentID: payload.metadata.documentID,
                    title: modulePayload.title,
                    summary: modulePayload.summary,
                    sortOrder: modulePayload.sortOrder,
                    sourcePageStart: modulePayload.sourcePageStart,
                    sourcePageEnd: modulePayload.sourcePageEnd,
                    examWeight: modulePayload.examWeight,
                    keyTerms: modulePayload.keyTerms,
                    checklistBullets: modulePayload.checklistBullets,
                    commonMistakes: modulePayload.commonMistakes
                )
                context.insert(created)
                return created
            }()

            module.documentID = payload.metadata.documentID
            module.title = modulePayload.title
            module.summary = modulePayload.summary
            module.sortOrder = modulePayload.sortOrder
            module.sourcePageStart = modulePayload.sourcePageStart
            module.sourcePageEnd = modulePayload.sourcePageEnd
            module.examWeight = modulePayload.examWeight
            module.keyTerms = modulePayload.keyTerms
            module.checklistBullets = modulePayload.checklistBullets
            module.commonMistakes = modulePayload.commonMistakes

            if masteryByID[modulePayload.id] == nil {
                context.insert(TopicMastery(moduleID: modulePayload.id))
            }

            for (index, rulePayload) in modulePayload.rules.enumerated() {
                seededRuleIDs.insert(rulePayload.id)
                let rule = rulesByID[rulePayload.id] ?? {
                    let created = StudyRule(
                        id: rulePayload.id,
                        moduleID: modulePayload.id,
                        sortOrder: index,
                        ruleText: rulePayload.ruleText,
                        isHighPriority: rulePayload.isHighPriority,
                        sourcePages: rulePayload.sourcePages
                    )
                    context.insert(created)
                    return created
                }()
                rule.moduleID = modulePayload.id
                rule.sortOrder = index
                rule.ruleText = rulePayload.ruleText
                rule.isHighPriority = rulePayload.isHighPriority
                rule.sourcePages = rulePayload.sourcePages
            }

            for (index, flashcardPayload) in modulePayload.flashcards.enumerated() {
                seededFlashcardIDs.insert(flashcardPayload.id)
                let difficulty = FlashcardDifficulty(rawValue: flashcardPayload.difficulty) ?? .core
                let card = flashcardsByID[flashcardPayload.id] ?? {
                    let created = Flashcard(
                        id: flashcardPayload.id,
                        moduleID: modulePayload.id,
                        sortOrder: index,
                        prompt: flashcardPayload.prompt,
                        answer: flashcardPayload.answer,
                        sourcePages: flashcardPayload.sourcePages,
                        difficulty: difficulty
                    )
                    context.insert(created)
                    return created
                }()
                card.moduleID = modulePayload.id
                card.sortOrder = index
                card.prompt = flashcardPayload.prompt
                card.answer = flashcardPayload.answer
                card.sourcePages = flashcardPayload.sourcePages
                card.difficulty = difficulty
            }

            for (index, questionPayload) in modulePayload.questions.enumerated() {
                seededQuestionIDs.insert(questionPayload.id)
                let prompt = questionsByID[questionPayload.id] ?? {
                    let created = PracticeQuestion(
                        id: questionPayload.id,
                        moduleID: modulePayload.id,
                        sortOrder: index,
                        question: questionPayload.question,
                        choices: questionPayload.choices,
                        correctChoice: questionPayload.correctChoice,
                        explanation: questionPayload.explanation,
                        sourcePages: questionPayload.sourcePages,
                        isFromPacketSample: questionPayload.isFromPacketSample
                    )
                    context.insert(created)
                    return created
                }()
                prompt.moduleID = modulePayload.id
                prompt.sortOrder = index
                prompt.question = questionPayload.question
                prompt.choices = questionPayload.choices
                prompt.correctChoice = questionPayload.correctChoice
                prompt.explanation = questionPayload.explanation
                prompt.sourcePages = questionPayload.sourcePages
                prompt.isFromPacketSample = questionPayload.isFromPacketSample
            }
        }

        for cramPayload in payload.cramSheets {
            seededCramIDs.insert(cramPayload.id)
            let cram = cramSheetsByID[cramPayload.id] ?? {
                let created = CramSheet(
                    id: cramPayload.id,
                    documentID: cramPayload.documentID,
                    title: cramPayload.title,
                    contentMarkdown: cramPayload.contentMarkdown
                )
                context.insert(created)
                return created
            }()
            cram.documentID = cramPayload.documentID
            cram.title = cramPayload.title
            cram.contentMarkdown = cramPayload.contentMarkdown
        }

        for module in modules where module.documentID == payload.metadata.documentID && !seededModuleIDs.contains(module.id) {
            context.delete(module)
        }
        for item in rules where !seededRuleIDs.contains(item.id) {
            context.delete(item)
        }
        for card in flashcards where !seededFlashcardIDs.contains(card.id) {
            context.delete(card)
        }
        for prompt in questions where !seededQuestionIDs.contains(prompt.id) {
            context.delete(prompt)
        }
        for cram in cramSheets where cram.documentID == payload.metadata.documentID && !seededCramIDs.contains(cram.id) {
            context.delete(cram)
        }
    }

    private static func loadSeededCourseContent() throws -> SeededCourseContent {
        if let bundleURL = Bundle.main.url(forResource: "notary-course-content", withExtension: "json", subdirectory: "SeededCourse") {
            let data = try Data(contentsOf: bundleURL)
            return try JSONDecoder().decode(SeededCourseContent.self, from: data)
        }

        let localURL = try seededCourseContentLocalURL()
        let data = try Data(contentsOf: localURL)
        return try JSONDecoder().decode(SeededCourseContent.self, from: data)
    }

    private static func ensureMilestones(context: ModelContext) throws {
        let existingMilestones = try context.fetch(FetchDescriptor<LaunchMilestone>())
        let existingMilestoneIDs = Set(existingMilestones.map(\.id))
        for template in milestoneTemplates where !existingMilestoneIDs.contains(template.id) {
            context.insert(
                LaunchMilestone(
                    id: template.id,
                    title: template.title,
                    details: template.details,
                    phase: template.phase,
                    sortOrder: template.sortOrder,
                    isComplete: false,
                    dueLabel: template.dueLabel,
                    blockerReason: template.blockerReason,
                    dependencyIDs: template.dependencyIDs,
                    sourceType: template.sourceType
                )
            )
        }

        let existingTasks = try context.fetch(FetchDescriptor<LaunchTask>())
        let existingTaskIDs = Set(existingTasks.map(\.id))
        for template in milestoneTemplates {
            for task in template.tasks where !existingTaskIDs.contains(task.id) {
                context.insert(
                    LaunchTask(
                        id: task.id,
                        milestoneID: template.id,
                        title: task.title,
                        isComplete: false,
                        requiresManualReview: template.sourceType == .manual,
                        evidenceType: task.evidenceType
                    )
                )
            }
        }
    }

    private static func applyDerivedDefaults(context: ModelContext) throws {
        let configs = try context.fetch(FetchDescriptor<NotaryAppConfig>())
        let milestones = try context.fetch(FetchDescriptor<LaunchMilestone>())
        let tasks = try context.fetch(FetchDescriptor<LaunchTask>())

        if let config = configs.first, config.coursePaid {
            if let milestone = milestones.first(where: { $0.id == "course_paid" }), !milestone.isComplete {
                milestone.isComplete = true
                milestone.completedAt = Date()
            }
            for task in tasks where task.milestoneID == "course_paid" && !task.isComplete {
                task.isComplete = true
                task.completedAt = Date()
                if task.evidenceValue == nil {
                    task.evidenceValue = "Seeded from paid course status"
                }
            }
        }
    }

    static func milestoneTemplatesForDisplay() -> [SeedMilestoneTemplate] {
        milestoneTemplates
    }

    private static let milestoneTemplates: [SeedMilestoneTemplate] = [
        .init(
            id: "course_paid",
            title: "Course paid",
            details: "Your Ohio notary course access is already paid for and active.",
            phase: .commission,
            sortOrder: 10,
            dueLabel: "Now",
            blockerReason: nil,
            dependencyIDs: [],
            sourceType: .derived,
            tasks: [
                ("course_paid_confirmed", "Confirm provider access and save login details", .note),
                ("course_packet_imported", "Open the seeded packet and verify it loads locally", .boolean)
            ]
        ),
        .init(
            id: "course_completed",
            title: "Course completed",
            details: "Finish the Ohio education requirement and review the packet notes.",
            phase: .commission,
            sortOrder: 20,
            dueLabel: "Before filing",
            blockerReason: nil,
            dependencyIDs: ["course_paid"],
            sourceType: .manual,
            tasks: [
                ("course_modules_complete", "Mark all provider modules complete", .boolean),
                ("packet_notes_reviewed", "Review packet notes and flag weak areas", .note)
            ]
        ),
        .init(
            id: "exam_passed",
            title: "Exam passed",
            details: "Pass the course assessment and save proof for filing.",
            phase: .commission,
            sortOrder: 30,
            dueLabel: "Immediately after course",
            blockerReason: nil,
            dependencyIDs: ["course_completed"],
            sourceType: .manual,
            tasks: [
                ("exam_passed_recorded", "Record pass date and result", .date),
                ("proof_saved", "Save completion proof to your files", .fileRef)
            ]
        ),
        .init(
            id: "application_filed",
            title: "Application filed",
            details: "Submit the Ohio application with BCI, signature sample, and course proof.",
            phase: .commission,
            sortOrder: 40,
            dueLabel: "Within BCI window",
            blockerReason: "BCI must still be fresh enough to use when you file.",
            dependencyIDs: ["exam_passed"],
            sourceType: .manual,
            tasks: [
                ("bci_verified", "Verify BCI report is still within the valid filing window", .date),
                ("application_submitted", "Submit the Secretary of State application", .date)
            ]
        ),
        .init(
            id: "commission_activated",
            title: "Commission activated",
            details: "Receive approval, take the oath in person, and receive your seal.",
            phase: .commission,
            sortOrder: 50,
            dueLabel: "Before first notarization",
            blockerReason: nil,
            dependencyIDs: ["application_filed"],
            sourceType: .manual,
            tasks: [
                ("commission_approved", "Record commission approval", .date),
                ("oath_completed", "Complete the in-person oath", .date),
                ("seal_received", "Order and receive the physical seal", .date)
            ]
        ),
        .init(
            id: "operations_ready",
            title: "Operations ready",
            details: "Prepare intake, pricing, travel zones, and journaling before first live work.",
            phase: .operations,
            sortOrder: 60,
            dueLabel: "Before first appointment",
            blockerReason: nil,
            dependencyIDs: ["commission_activated"],
            sourceType: .manual,
            tasks: [
                ("intake_ready", "Set up intake form and client prep checklist", .boolean),
                ("pricing_ready", "Set pricing, travel, and no-show policies", .boolean),
                ("journal_ready", "Set up a paper or digital logging habit", .boolean)
            ]
        ),
        .init(
            id: "ron_ready",
            title: "RON stack ready",
            details: "Finish the Ohio RON course, filing, and tool setup.",
            phase: .ron,
            sortOrder: 70,
            dueLabel: "After commission",
            blockerReason: "RON cannot be offered until commission, RON filing, e-signature, e-seal, and recording workflow are all ready.",
            dependencyIDs: ["commission_activated"],
            sourceType: .manual,
            tasks: [
                ("ron_course_done", "Complete the RON course and exam", .boolean),
                ("ron_filing_done", "Submit the RON filing", .date),
                ("ron_tools_done", "Configure platform, e-signature, e-seal, and recording workflow", .boolean)
            ]
        ),
        .init(
            id: "business_basics",
            title: "Business basics ready",
            details: "Set up clean business structure and separation from employer work.",
            phase: .business,
            sortOrder: 80,
            dueLabel: "Before scale",
            blockerReason: nil,
            dependencyIDs: ["operations_ready"],
            sourceType: .manual,
            tasks: [
                ("entity_setup", "Decide and complete entity setup", .boolean),
                ("banking_ready", "Open business banking and bookkeeping flow", .boolean),
                ("eo_ready", "Obtain E&O insurance", .boolean),
                ("employer_private_split", "Separate employer and private work systems", .boolean)
            ]
        ),
        .init(
            id: "first_revenue",
            title: "First revenue milestones",
            details: "Track the first wins in employer, private mobile, and later RON work.",
            phase: .revenue,
            sortOrder: 90,
            dueLabel: "After commission goes live",
            blockerReason: nil,
            dependencyIDs: ["operations_ready"],
            sourceType: .manual,
            tasks: [
                ("first_employer_job", "Complete first employer/internal notary job", .date),
                ("first_mobile_job", "Complete first private mobile appointment", .date),
                ("first_paid_invoice", "Mark first invoice paid", .date),
                ("first_ron_job", "Complete first RON job once authorized", .date)
            ]
        )
    ]
}
