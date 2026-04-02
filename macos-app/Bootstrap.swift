import Foundation
import PDFKit
import SwiftData

private let seededCourseID = "ohio-notary-course-packet"
private let seededCourseFileName = "OhioNotaryCoursePacket.pdf"

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
        let destination = destinationDirectory.appendingPathComponent(seededCourseFileName)

        if let sourceURL = Bundle.main.url(forResource: "OhioNotaryCoursePacket", withExtension: "pdf", subdirectory: "SeededCourse"),
           !FileManager.default.fileExists(atPath: destination.path) {
            try? FileManager.default.removeItem(at: destination)
            try FileManager.default.copyItem(at: sourceURL, to: destination)
        }

        let pageCount = PDFDocument(url: destination)?.pageCount ?? 149

        if let existing {
            existing.localPath = destination.path
            existing.pageCount = pageCount
        } else {
            let document = CourseDocument(
                id: seededCourseID,
                title: "Ohio Notary Course Packet",
                fileName: seededCourseFileName,
                localPath: destination.path,
                sourceType: .seeded,
                status: .notStarted,
                pageCount: pageCount,
                lastOpenedAt: nil
            )
            context.insert(document)
            context.insert(StudyProgress(documentID: seededCourseID))
        }
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
