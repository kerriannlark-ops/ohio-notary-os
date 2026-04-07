import SwiftData
import SwiftUI

@main
struct NotaryOSMacApp: App {
    private let container: ModelContainer = {
        let schema = Schema([
            CourseDocument.self,
            StudyProgress.self,
            StudyNote.self,
            DocumentBookmark.self,
            StudyModule.self,
            StudyRule.self,
            Flashcard.self,
            PracticeQuestion.self,
            QuizAttempt.self,
            TopicMastery.self,
            CramSheet.self,
            LaunchMilestone.self,
            LaunchTask.self,
            NotaryAppConfig.self
        ])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
        do {
            return try ModelContainer(for: schema, configurations: [configuration])
        } catch {
            fatalError("Unable to create model container: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            RootShellView()
                .frame(minWidth: 1240, minHeight: 840)
        }
        .modelContainer(container)
        .windowToolbarStyle(.unified(showsTitle: true))
        .commands {
            CommandGroup(replacing: .newItem) { }
        }
    }
}
