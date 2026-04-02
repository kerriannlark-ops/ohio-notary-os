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
