import Foundation

enum MilestoneVisualStatus {
    case completed
    case available
    case blocked

    var label: String {
        switch self {
        case .completed: return "Completed"
        case .available: return "Ready now"
        case .blocked: return "Blocked"
        }
    }

    var tone: NotaryStatusTone {
        switch self {
        case .completed: return .success
        case .available: return .active
        case .blocked: return .blocked
        }
    }
}

struct ReadinessSnapshot {
    let nextActionTitle: String
    let nextActionDetail: String
    let blockers: [String]
    let courseProgress: Double
    let courseStatusLabel: String
    let commissionProgress: Double
    let ronProgress: Double
    let businessProgress: Double
    let revenueProgress: Double
    let canOperateInPerson: Bool
    let canOperateRON: Bool
    let recommendedDocumentID: String?
    let dueSoon: [String]
}

enum NotaryOSLogic {
    static func tasks(for milestone: LaunchMilestone, in tasks: [LaunchTask]) -> [LaunchTask] {
        tasks
            .filter { $0.milestoneID == milestone.id }
            .sorted { $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedAscending }
    }

    static func milestoneStatus(for milestone: LaunchMilestone, milestones: [LaunchMilestone]) -> MilestoneVisualStatus {
        if milestone.isComplete { return .completed }
        let completedIDs = Set(milestones.filter(\.isComplete).map(\.id))
        let unmetDependencies = milestone.dependencyIDs.filter { !completedIDs.contains($0) }
        return unmetDependencies.isEmpty ? .available : .blocked
    }

    static func completionRatio(for phase: LaunchPhaseCategory, milestones: [LaunchMilestone]) -> Double {
        let scoped = milestones.filter { $0.phaseCategory == phase }
        guard !scoped.isEmpty else { return 0 }
        let completed = scoped.filter(\.isComplete).count
        return Double(completed) / Double(scoped.count)
    }

    static func courseProgress(for documents: [CourseDocument], progress: [StudyProgress]) -> Double {
        guard !documents.isEmpty else { return 0 }
        let totals = documents.map { document in
            progress.first(where: { $0.documentID == document.id })?.percentComplete ?? 0
        }
        return totals.reduce(0, +) / Double(max(totals.count, 1))
    }

    static func courseStatusLabel(for documents: [CourseDocument], progress: [StudyProgress]) -> String {
        let pct = courseProgress(for: documents, progress: progress)
        if pct >= 0.99 { return "Reviewed" }
        if pct > 0.02 { return "In progress" }
        return "Ready to start"
    }

    static func nextMilestone(milestones: [LaunchMilestone]) -> LaunchMilestone? {
        milestones
            .sorted { $0.sortOrder < $1.sortOrder }
            .first(where: { !$0.isComplete && milestoneStatus(for: $0, milestones: milestones) == .available })
    }

    static func blockerMilestones(milestones: [LaunchMilestone]) -> [LaunchMilestone] {
        milestones
            .filter { !$0.isComplete && milestoneStatus(for: $0, milestones: milestones) == .blocked }
            .sorted { $0.sortOrder < $1.sortOrder }
    }

    static func dueSoon(milestones: [LaunchMilestone]) -> [String] {
        milestones
            .filter { !$0.isComplete }
            .sorted { $0.sortOrder < $1.sortOrder }
            .compactMap { milestone in
                guard let dueLabel = milestone.dueLabel else { return nil }
                return "\(milestone.title): \(dueLabel)"
            }
            .prefix(3)
            .map { $0 }
    }

    static func inPersonReady(milestones: [LaunchMilestone]) -> Bool {
        milestoneComplete("commission_activated", in: milestones) && milestoneComplete("operations_ready", in: milestones)
    }

    static func ronReady(milestones: [LaunchMilestone]) -> Bool {
        inPersonReady(milestones: milestones) && milestoneComplete("ron_ready", in: milestones)
    }

    static func readinessSnapshot(documents: [CourseDocument], progress: [StudyProgress], milestones: [LaunchMilestone]) -> ReadinessSnapshot {
        let next = nextMilestone(milestones: milestones)
        let blockers = blockerMilestones(milestones: milestones).prefix(3).map { milestone in
            milestone.blockerReason ?? "Complete prior milestones before \(milestone.title.lowercased())."
        }

        let nextTitle = next?.title ?? "Stay in maintenance mode"
        let nextDetail = next?.details ?? "You have completed the current local launch checklist. Use the Operations tab to run active notary work."

        return ReadinessSnapshot(
            nextActionTitle: nextTitle,
            nextActionDetail: nextDetail,
            blockers: Array(blockers),
            courseProgress: courseProgress(for: documents, progress: progress),
            courseStatusLabel: courseStatusLabel(for: documents, progress: progress),
            commissionProgress: completionRatio(for: .commission, milestones: milestones),
            ronProgress: completionRatio(for: .ron, milestones: milestones),
            businessProgress: completionRatio(for: .business, milestones: milestones),
            revenueProgress: completionRatio(for: .revenue, milestones: milestones),
            canOperateInPerson: inPersonReady(milestones: milestones),
            canOperateRON: ronReady(milestones: milestones),
            recommendedDocumentID: documents.first?.id,
            dueSoon: dueSoon(milestones: milestones)
        )
    }

    static func percentString(_ value: Double) -> String {
        let pct = Int((value * 100).rounded())
        return "\(pct)%"
    }

    static func formatDate(_ date: Date?) -> String {
        guard let date else { return "—" }
        return date.formatted(date: .abbreviated, time: .omitted)
    }

    static func milestoneComplete(_ id: String, in milestones: [LaunchMilestone]) -> Bool {
        milestones.first(where: { $0.id == id })?.isComplete ?? false
    }
}
