import Foundation
import SwiftData

enum CourseSourceType: String, Codable, CaseIterable {
    case seeded
    case imported
}

enum CourseDocumentStatus: String, Codable, CaseIterable {
    case notStarted
    case reading
    case reviewed
}

enum LaunchPhaseCategory: String, Codable, CaseIterable {
    case commission
    case operations
    case ron
    case business
    case revenue

    var title: String {
        switch self {
        case .commission: return "Commission"
        case .operations: return "Operations"
        case .ron: return "RON"
        case .business: return "Business"
        case .revenue: return "Revenue"
        }
    }
}

enum LaunchSourceType: String, Codable, CaseIterable {
    case manual
    case derived
}

enum LaunchEvidenceType: String, Codable, CaseIterable {
    case date
    case boolean
    case fileRef
    case note
}

enum FlashcardDifficulty: String, Codable, CaseIterable {
    case core
    case challenge
}

enum QuizMode: String, Codable, CaseIterable {
    case fullExam
    case module
}

enum StudyWorkspaceTab: String, Codable, CaseIterable, Hashable {
    case reader
    case outline
    case flashcards
    case quiz
    case cram

    var title: String {
        switch self {
        case .reader: return "Reader"
        case .outline: return "Outline"
        case .flashcards: return "Flashcards"
        case .quiz: return "Quiz"
        case .cram: return "Cram"
        }
    }
}

@Model
final class CourseDocument {
    @Attribute(.unique) var id: String
    var title: String
    var fileName: String
    var localPath: String
    var sourceType: CourseSourceType.RawValue
    var status: CourseDocumentStatus.RawValue
    var pageCount: Int
    var lastOpenedAt: Date?
    var createdAt: Date

    init(
        id: String = UUID().uuidString,
        title: String,
        fileName: String,
        localPath: String,
        sourceType: CourseSourceType,
        status: CourseDocumentStatus = .notStarted,
        pageCount: Int = 0,
        lastOpenedAt: Date? = nil,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.fileName = fileName
        self.localPath = localPath
        self.sourceType = sourceType.rawValue
        self.status = status.rawValue
        self.pageCount = pageCount
        self.lastOpenedAt = lastOpenedAt
        self.createdAt = createdAt
    }

    var source: CourseSourceType {
        get { CourseSourceType(rawValue: sourceType) ?? .seeded }
        set { sourceType = newValue.rawValue }
    }

    var documentStatus: CourseDocumentStatus {
        get { CourseDocumentStatus(rawValue: status) ?? .notStarted }
        set { status = newValue.rawValue }
    }
}

@Model
final class StudyProgress {
    @Attribute(.unique) var documentID: String
    var lastPageRead: Int
    var percentComplete: Double
    var lastStudiedAt: Date?

    init(documentID: String, lastPageRead: Int = 1, percentComplete: Double = 0, lastStudiedAt: Date? = nil) {
        self.documentID = documentID
        self.lastPageRead = lastPageRead
        self.percentComplete = percentComplete
        self.lastStudiedAt = lastStudiedAt
    }
}

@Model
final class StudyNote {
    @Attribute(.unique) var id: String
    var documentID: String
    var pageNumber: Int
    var noteText: String
    var createdAt: Date

    init(id: String = UUID().uuidString, documentID: String, pageNumber: Int, noteText: String, createdAt: Date = .now) {
        self.id = id
        self.documentID = documentID
        self.pageNumber = pageNumber
        self.noteText = noteText
        self.createdAt = createdAt
    }
}

@Model
final class DocumentBookmark {
    @Attribute(.unique) var id: String
    var documentID: String
    var pageNumber: Int
    var label: String
    var createdAt: Date

    init(id: String = UUID().uuidString, documentID: String, pageNumber: Int, label: String, createdAt: Date = .now) {
        self.id = id
        self.documentID = documentID
        self.pageNumber = pageNumber
        self.label = label
        self.createdAt = createdAt
    }
}

@Model
final class StudyModule {
    @Attribute(.unique) var id: String
    var documentID: String
    var title: String
    var summary: String
    var sortOrder: Int
    var sourcePageStart: Int
    var sourcePageEnd: Int
    var examWeight: Double
    var keyTermsRaw: String
    var checklistBulletsRaw: String
    var commonMistakesRaw: String

    init(
        id: String,
        documentID: String,
        title: String,
        summary: String,
        sortOrder: Int,
        sourcePageStart: Int,
        sourcePageEnd: Int,
        examWeight: Double,
        keyTerms: [String],
        checklistBullets: [String],
        commonMistakes: [String]
    ) {
        self.id = id
        self.documentID = documentID
        self.title = title
        self.summary = summary
        self.sortOrder = sortOrder
        self.sourcePageStart = sourcePageStart
        self.sourcePageEnd = sourcePageEnd
        self.examWeight = examWeight
        self.keyTermsRaw = keyTerms.joined(separator: "\n")
        self.checklistBulletsRaw = checklistBullets.joined(separator: "\n")
        self.commonMistakesRaw = commonMistakes.joined(separator: "\n")
    }

    var keyTerms: [String] {
        get { keyTermsRaw.split(separator: "\n").map(String.init).filter { !$0.isEmpty } }
        set { keyTermsRaw = newValue.joined(separator: "\n") }
    }

    var checklistBullets: [String] {
        get { checklistBulletsRaw.split(separator: "\n").map(String.init).filter { !$0.isEmpty } }
        set { checklistBulletsRaw = newValue.joined(separator: "\n") }
    }

    var commonMistakes: [String] {
        get { commonMistakesRaw.split(separator: "\n").map(String.init).filter { !$0.isEmpty } }
        set { commonMistakesRaw = newValue.joined(separator: "\n") }
    }

    var pageRangeLabel: String {
        sourcePageStart == sourcePageEnd ? "p. \(sourcePageStart)" : "pp. \(sourcePageStart)-\(sourcePageEnd)"
    }
}

@Model
final class StudyRule {
    @Attribute(.unique) var id: String
    var moduleID: String
    var sortOrder: Int
    var ruleText: String
    var isHighPriority: Bool
    var sourcePagesRaw: String

    init(id: String, moduleID: String, sortOrder: Int, ruleText: String, isHighPriority: Bool, sourcePages: String) {
        self.id = id
        self.moduleID = moduleID
        self.sortOrder = sortOrder
        self.ruleText = ruleText
        self.isHighPriority = isHighPriority
        self.sourcePagesRaw = sourcePages
    }

    var sourcePages: String {
        get { sourcePagesRaw }
        set { sourcePagesRaw = newValue }
    }
}

@Model
final class Flashcard {
    @Attribute(.unique) var id: String
    var moduleID: String
    var sortOrder: Int
    var prompt: String
    var answer: String
    var sourcePagesRaw: String
    var difficultyRaw: FlashcardDifficulty.RawValue
    var isHard: Bool
    var lastReviewedAt: Date?

    init(
        id: String,
        moduleID: String,
        sortOrder: Int,
        prompt: String,
        answer: String,
        sourcePages: String,
        difficulty: FlashcardDifficulty,
        isHard: Bool = false,
        lastReviewedAt: Date? = nil
    ) {
        self.id = id
        self.moduleID = moduleID
        self.sortOrder = sortOrder
        self.prompt = prompt
        self.answer = answer
        self.sourcePagesRaw = sourcePages
        self.difficultyRaw = difficulty.rawValue
        self.isHard = isHard
        self.lastReviewedAt = lastReviewedAt
    }

    var sourcePages: String {
        get { sourcePagesRaw }
        set { sourcePagesRaw = newValue }
    }

    var difficulty: FlashcardDifficulty {
        get { FlashcardDifficulty(rawValue: difficultyRaw) ?? .core }
        set { difficultyRaw = newValue.rawValue }
    }
}

@Model
final class PracticeQuestion {
    @Attribute(.unique) var id: String
    var moduleID: String
    var sortOrder: Int
    var question: String
    var choicesRaw: String
    var correctChoice: String
    var explanation: String
    var sourcePagesRaw: String
    var isFromPacketSample: Bool

    init(
        id: String,
        moduleID: String,
        sortOrder: Int,
        question: String,
        choices: [String],
        correctChoice: String,
        explanation: String,
        sourcePages: String,
        isFromPacketSample: Bool
    ) {
        self.id = id
        self.moduleID = moduleID
        self.sortOrder = sortOrder
        self.question = question
        self.choicesRaw = Self.encode(choices)
        self.correctChoice = correctChoice
        self.explanation = explanation
        self.sourcePagesRaw = sourcePages
        self.isFromPacketSample = isFromPacketSample
    }

    var choices: [String] {
        get { Self.decode(choicesRaw) }
        set { choicesRaw = Self.encode(newValue) }
    }

    var sourcePages: String {
        get { sourcePagesRaw }
        set { sourcePagesRaw = newValue }
    }

    private static func encode(_ values: [String]) -> String {
        let data = try? JSONEncoder().encode(values)
        return data.flatMap { String(data: $0, encoding: .utf8) } ?? "[]"
    }

    private static func decode(_ raw: String) -> [String] {
        guard let data = raw.data(using: .utf8), let values = try? JSONDecoder().decode([String].self, from: data) else {
            return []
        }
        return values
    }
}

@Model
final class QuizAttempt {
    @Attribute(.unique) var id: String
    var startedAt: Date
    var finishedAt: Date
    var scorePercent: Double
    var totalQuestions: Int
    var moduleScopeRaw: String
    var incorrectQuestionIDsRaw: String
    var quizModeRaw: QuizMode.RawValue

    init(
        id: String = UUID().uuidString,
        startedAt: Date,
        finishedAt: Date,
        scorePercent: Double,
        totalQuestions: Int,
        moduleScope: [String],
        incorrectQuestionIDs: [String],
        quizMode: QuizMode
    ) {
        self.id = id
        self.startedAt = startedAt
        self.finishedAt = finishedAt
        self.scorePercent = scorePercent
        self.totalQuestions = totalQuestions
        self.moduleScopeRaw = Self.encode(moduleScope)
        self.incorrectQuestionIDsRaw = Self.encode(incorrectQuestionIDs)
        self.quizModeRaw = quizMode.rawValue
    }

    var moduleScope: [String] {
        get { Self.decode(moduleScopeRaw) }
        set { moduleScopeRaw = Self.encode(newValue) }
    }

    var incorrectQuestionIDs: [String] {
        get { Self.decode(incorrectQuestionIDsRaw) }
        set { incorrectQuestionIDsRaw = Self.encode(newValue) }
    }

    var quizMode: QuizMode {
        get { QuizMode(rawValue: quizModeRaw) ?? .module }
        set { quizModeRaw = newValue.rawValue }
    }

    private static func encode(_ values: [String]) -> String {
        let data = try? JSONEncoder().encode(values)
        return data.flatMap { String(data: $0, encoding: .utf8) } ?? "[]"
    }

    private static func decode(_ raw: String) -> [String] {
        guard let data = raw.data(using: .utf8), let values = try? JSONDecoder().decode([String].self, from: data) else {
            return []
        }
        return values
    }
}

@Model
final class TopicMastery {
    @Attribute(.unique) var id: String
    var moduleID: String
    var confidenceScore: Double
    var lastReviewedAt: Date?
    var lastQuizScore: Double

    init(moduleID: String, confidenceScore: Double = 0.4, lastReviewedAt: Date? = nil, lastQuizScore: Double = 0) {
        self.id = moduleID
        self.moduleID = moduleID
        self.confidenceScore = confidenceScore
        self.lastReviewedAt = lastReviewedAt
        self.lastQuizScore = lastQuizScore
    }
}

@Model
final class CramSheet {
    @Attribute(.unique) var id: String
    var documentID: String
    var title: String
    var contentMarkdown: String
    var generatedAt: Date

    init(id: String, documentID: String, title: String, contentMarkdown: String, generatedAt: Date = .now) {
        self.id = id
        self.documentID = documentID
        self.title = title
        self.contentMarkdown = contentMarkdown
        self.generatedAt = generatedAt
    }
}

@Model
final class LaunchMilestone {
    @Attribute(.unique) var id: String
    var title: String
    var details: String
    var phase: LaunchPhaseCategory.RawValue
    var sortOrder: Int
    var isComplete: Bool
    var dueLabel: String?
    var blockerReason: String?
    var dependencyIDsRaw: String
    var sourceTypeRaw: LaunchSourceType.RawValue
    var completedAt: Date?
    var ownerNotes: String?

    init(
        id: String,
        title: String,
        details: String,
        phase: LaunchPhaseCategory,
        sortOrder: Int,
        isComplete: Bool = false,
        dueLabel: String? = nil,
        blockerReason: String? = nil,
        dependencyIDs: [String] = [],
        sourceType: LaunchSourceType = .manual,
        completedAt: Date? = nil,
        ownerNotes: String? = nil
    ) {
        self.id = id
        self.title = title
        self.details = details
        self.phase = phase.rawValue
        self.sortOrder = sortOrder
        self.isComplete = isComplete
        self.dueLabel = dueLabel
        self.blockerReason = blockerReason
        self.dependencyIDsRaw = dependencyIDs.joined(separator: ",")
        self.sourceTypeRaw = sourceType.rawValue
        self.completedAt = completedAt
        self.ownerNotes = ownerNotes
    }

    var phaseCategory: LaunchPhaseCategory {
        get { LaunchPhaseCategory(rawValue: phase) ?? .commission }
        set { phase = newValue.rawValue }
    }

    var dependencyIDs: [String] {
        get { dependencyIDsRaw.split(separator: ",").map { String($0) }.filter { !$0.isEmpty } }
        set { dependencyIDsRaw = newValue.joined(separator: ",") }
    }

    var sourceType: LaunchSourceType {
        get { LaunchSourceType(rawValue: sourceTypeRaw) ?? .manual }
        set { sourceTypeRaw = newValue.rawValue }
    }
}

@Model
final class LaunchTask {
    @Attribute(.unique) var id: String
    var milestoneID: String
    var title: String
    var isComplete: Bool
    var requiresManualReview: Bool
    var completedAt: Date?
    var evidenceTypeRaw: LaunchEvidenceType.RawValue
    var evidenceValue: String?

    init(
        id: String,
        milestoneID: String,
        title: String,
        isComplete: Bool = false,
        requiresManualReview: Bool = false,
        completedAt: Date? = nil,
        evidenceType: LaunchEvidenceType = .boolean,
        evidenceValue: String? = nil
    ) {
        self.id = id
        self.milestoneID = milestoneID
        self.title = title
        self.isComplete = isComplete
        self.requiresManualReview = requiresManualReview
        self.completedAt = completedAt
        self.evidenceTypeRaw = evidenceType.rawValue
        self.evidenceValue = evidenceValue
    }

    var evidenceType: LaunchEvidenceType {
        get { LaunchEvidenceType(rawValue: evidenceTypeRaw) ?? .boolean }
        set { evidenceTypeRaw = newValue.rawValue }
    }
}

@Model
final class NotaryAppConfig {
    @Attribute(.unique) var id: String
    var webBaseURL: String
    var useProductionURL: Bool
    var onboardingCompleted: Bool
    var coursePaid: Bool

    init(
        id: String = "primary",
        webBaseURL: String = "https://ohio-notary-os.netlify.app/dashboard",
        useProductionURL: Bool = true,
        onboardingCompleted: Bool = false,
        coursePaid: Bool = true
    ) {
        self.id = id
        self.webBaseURL = webBaseURL
        self.useProductionURL = useProductionURL
        self.onboardingCompleted = onboardingCompleted
        self.coursePaid = coursePaid
    }
}

enum AppSection: Hashable, CaseIterable {
    case startHere
    case courseLibrary
    case studyProgress
    case licensingChecklist
    case operations
    case settings
    case studySession

    static var sidebarCases: [AppSection] {
        [.startHere, .courseLibrary, .studyProgress, .licensingChecklist, .operations, .settings]
    }

    var title: String {
        switch self {
        case .startHere: return "Start Here"
        case .courseLibrary: return "Course Library"
        case .studyProgress: return "Study Progress"
        case .licensingChecklist: return "Licensing Checklist"
        case .operations: return "Operations"
        case .settings: return "Settings"
        case .studySession: return "Study Session"
        }
    }

    var systemImage: String {
        switch self {
        case .startHere: return "bolt.circle"
        case .courseLibrary: return "books.vertical"
        case .studyProgress: return "chart.bar.doc.horizontal"
        case .licensingChecklist: return "checklist"
        case .operations: return "safari"
        case .settings: return "gearshape"
        case .studySession: return "doc.text.magnifyingglass"
        }
    }
}
