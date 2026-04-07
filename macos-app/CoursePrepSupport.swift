import Foundation

struct SeededCourseContent: Decodable {
    struct Metadata: Decodable {
        struct Exam: Decodable {
            let questionCount: Int
            let durationMinutes: Int
            let passingScorePercent: Int
            let retakeWindowDays: Int
        }

        let sourceFileName: String
        let packetDate: String
        let pageCount: Int
        let documentID: String
        let documentTitle: String
        let contentVersion: String
        let exam: Exam
        let courseProvider: String
        let privateUseOnly: Bool
        let notes: [String]
    }

    struct Module: Decodable {
        struct RuleItem: Decodable {
            let id: String
            let ruleText: String
            let sourcePages: String
            let isHighPriority: Bool
        }

        struct FlashcardItem: Decodable {
            let id: String
            let prompt: String
            let answer: String
            let sourcePages: String
            let difficulty: String
        }

        struct QuestionItem: Decodable {
            let id: String
            let question: String
            let choices: [String]
            let correctChoice: String
            let explanation: String
            let sourcePages: String
            let isFromPacketSample: Bool
        }

        let id: String
        let title: String
        let summary: String
        let sortOrder: Int
        let sourcePageStart: Int
        let sourcePageEnd: Int
        let examWeight: Double
        let keyTerms: [String]
        let checklistBullets: [String]
        let commonMistakes: [String]
        let rules: [RuleItem]
        let flashcards: [FlashcardItem]
        let questions: [QuestionItem]
    }

    struct CramSheetItem: Decodable {
        let id: String
        let documentID: String
        let title: String
        let contentMarkdown: String
    }

    let metadata: Metadata
    let modules: [Module]
    let cramSheets: [CramSheetItem]
}

struct QuizResult {
    let scorePercent: Double
    let totalQuestions: Int
    let incorrectQuestionIDs: [String]
    let moduleScores: [String: Double]
}

struct StudyDashboardSnapshot {
    let latestQuizScoreLabel: String
    let bestQuizScoreLabel: String
    let weakTopicTitles: [String]
    let flashcardsDueCount: Int
    let moduleCoverageCount: Int
    let sampleQuestionCount: Int
    let passTargetLabel: String
}
