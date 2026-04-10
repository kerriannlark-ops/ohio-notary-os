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
    let latestQuizScoreLabel: String
    let bestQuizScoreLabel: String
    let weakTopics: [String]
    let passTargetLabel: String
    let flashcardsDueCount: Int
    let moduleCoverageCount: Int
}

enum NotaryOSLogic {
    static func tasks(for milestone: LaunchMilestone, in tasks: [LaunchTask]) -> [LaunchTask] {
        tasks
            .filter { $0.milestoneID == milestone.id }
            .sorted { $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedAscending }
    }

    static func module(for page: Int, in modules: [StudyModule]) -> [StudyModule] {
        modules
            .filter { page >= $0.sourcePageStart && page <= $0.sourcePageEnd }
            .sorted { $0.sortOrder < $1.sortOrder }
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

    static func courseStatusLabel(for documents: [CourseDocument], progress: [StudyProgress], attempts: [QuizAttempt]) -> String {
        let pct = courseProgress(for: documents, progress: progress)
        let latest = attempts.sorted { $0.finishedAt > $1.finishedAt }.first?.scorePercent ?? 0
        if latest >= 80 { return "Exam-ready" }
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

    static func latestQuizScoreLabel(attempts: [QuizAttempt]) -> String {
        guard let latest = attempts.sorted(by: { $0.finishedAt > $1.finishedAt }).first else { return "No quiz yet" }
        return percentString(latest.scorePercent / 100)
    }

    static func bestQuizScoreLabel(attempts: [QuizAttempt]) -> String {
        guard let best = attempts.max(by: { $0.scorePercent < $1.scorePercent }) else { return "No score yet" }
        return percentString(best.scorePercent / 100)
    }

    static func weakTopics(modules: [StudyModule], mastery: [TopicMastery]) -> [String] {
        let masteryByModule = Dictionary(uniqueKeysWithValues: mastery.map { ($0.moduleID, $0) })
        return modules
            .sorted { ($0.examWeight, -Double($0.sortOrder)) > ($1.examWeight, -Double($1.sortOrder)) }
            .filter {
                guard let topic = masteryByModule[$0.id] else { return true }
                return topic.lastQuizScore < 80 || topic.confidenceScore < 0.67
            }
            .prefix(4)
            .map(\.title)
    }

    static func flashcardsDueCount(cards: [Flashcard]) -> Int {
        let sevenDaysAgo = Calendar.current.date(byAdding: .day, value: -7, to: Date()) ?? Date.distantPast
        return cards.filter { card in
            card.isHard || card.lastReviewedAt == nil || (card.lastReviewedAt ?? .distantPast) < sevenDaysAgo
        }.count
    }

    static func studyDashboardSnapshot(modules: [StudyModule], flashcards: [Flashcard], questions: [PracticeQuestion], mastery: [TopicMastery], attempts: [QuizAttempt]) -> StudyDashboardSnapshot {
        StudyDashboardSnapshot(
            latestQuizScoreLabel: latestQuizScoreLabel(attempts: attempts),
            bestQuizScoreLabel: bestQuizScoreLabel(attempts: attempts),
            weakTopicTitles: weakTopics(modules: modules, mastery: mastery),
            flashcardsDueCount: flashcardsDueCount(cards: flashcards),
            moduleCoverageCount: modules.count,
            sampleQuestionCount: questions.filter(\.isFromPacketSample).count,
            passTargetLabel: "80% to pass"
        )
    }

    static func readinessSnapshot(
        documents: [CourseDocument],
        progress: [StudyProgress],
        milestones: [LaunchMilestone],
        modules: [StudyModule],
        flashcards: [Flashcard],
        questions: [PracticeQuestion],
        attempts: [QuizAttempt],
        mastery: [TopicMastery]
    ) -> ReadinessSnapshot {
        let next = nextMilestone(milestones: milestones)
        let blockers = blockerMilestones(milestones: milestones).prefix(3).map { milestone in
            milestone.blockerReason ?? "Complete prior milestones before \(milestone.title.lowercased())."
        }
        let weak = weakTopics(modules: modules, mastery: mastery)
        let studySnapshot = studyDashboardSnapshot(modules: modules, flashcards: flashcards, questions: questions, mastery: mastery, attempts: attempts)
        let coursePct = courseProgress(for: documents, progress: progress)

        let nextTitle: String
        let nextDetail: String
        if coursePct < 0.25 {
            nextTitle = "Resume the course packet"
            nextDetail = "Work through the packet outline before worrying about business setup. Your weakest move right now would be jumping ahead without the rules memorized."
        } else if !attempts.isEmpty, !weak.isEmpty {
            nextTitle = "Attack your weak topics"
            nextDetail = "Focus on \(weak.prefix(2).joined(separator: " and ")) before your next practice quiz."
        } else if let next {
            nextTitle = next.title
            nextDetail = next.details
        } else {
            nextTitle = "Stay in maintenance mode"
            nextDetail = "You have completed the current local launch checklist. Use the Operations tab to run active notary work."
        }

        return ReadinessSnapshot(
            nextActionTitle: nextTitle,
            nextActionDetail: nextDetail,
            blockers: Array(blockers),
            courseProgress: coursePct,
            courseStatusLabel: courseStatusLabel(for: documents, progress: progress, attempts: attempts),
            commissionProgress: completionRatio(for: .commission, milestones: milestones),
            ronProgress: completionRatio(for: .ron, milestones: milestones),
            businessProgress: completionRatio(for: .business, milestones: milestones),
            revenueProgress: completionRatio(for: .revenue, milestones: milestones),
            canOperateInPerson: inPersonReady(milestones: milestones),
            canOperateRON: ronReady(milestones: milestones),
            recommendedDocumentID: documents.first?.id,
            dueSoon: dueSoon(milestones: milestones),
            latestQuizScoreLabel: studySnapshot.latestQuizScoreLabel,
            bestQuizScoreLabel: studySnapshot.bestQuizScoreLabel,
            weakTopics: weak,
            passTargetLabel: studySnapshot.passTargetLabel,
            flashcardsDueCount: studySnapshot.flashcardsDueCount,
            moduleCoverageCount: studySnapshot.moduleCoverageCount
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

    static func fullExamQuestions(from questions: [PracticeQuestion], limit: Int = 30) -> [PracticeQuestion] {
        Array(questions.sorted { $0.id < $1.id }.prefix(limit))
    }

    static func gradeQuiz(questions: [PracticeQuestion], answers: [String: Int]) -> QuizResult {
        guard !questions.isEmpty else {
            return QuizResult(scorePercent: 0, totalQuestions: 0, incorrectQuestionIDs: [], moduleScores: [:])
        }

        var correctCount = 0
        var incorrect: [String] = []
        var moduleCorrect: [String: Int] = [:]
        var moduleTotals: [String: Int] = [:]

        for question in questions {
            moduleTotals[question.moduleID, default: 0] += 1
            let selectedIndex = answers[question.id]
            let choiceLetters = ["A", "B", "C", "D", "E"]
            let selectedLetter = selectedIndex.flatMap { index in
                guard index >= 0, index < choiceLetters.count else { return nil }
                return choiceLetters[index]
            }
            if selectedLetter == question.correctChoice {
                correctCount += 1
                moduleCorrect[question.moduleID, default: 0] += 1
            } else {
                incorrect.append(question.id)
            }
        }

        let moduleScores = Dictionary(uniqueKeysWithValues: moduleTotals.map { moduleID, total in
            let correct = moduleCorrect[moduleID, default: 0]
            let score = total == 0 ? 0 : (Double(correct) / Double(total)) * 100
            return (moduleID, score)
        })

        return QuizResult(
            scorePercent: (Double(correctCount) / Double(questions.count)) * 100,
            totalQuestions: questions.count,
            incorrectQuestionIDs: incorrect,
            moduleScores: moduleScores
        )
    }
}
