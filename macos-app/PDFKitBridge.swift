import PDFKit
import SwiftUI

struct PDFDocumentView: NSViewRepresentable {
    let url: URL
    @Binding var currentPageIndex: Int

    func makeCoordinator() -> Coordinator {
        Coordinator(currentPageIndex: $currentPageIndex)
    }

    func makeNSView(context: Context) -> PDFView {
        let view = PDFView()
        view.autoScales = true
        view.displayMode = .singlePageContinuous
        view.displayDirection = .vertical
        view.document = PDFDocument(url: url)
        NotificationCenter.default.addObserver(
            context.coordinator,
            selector: #selector(Coordinator.pageDidChange(_:)),
            name: Notification.Name.PDFViewPageChanged,
            object: view
        )
        if let document = view.document,
           document.pageCount > 0,
           let page = document.page(at: max(0, min(currentPageIndex - 1, document.pageCount - 1))) {
            view.go(to: page)
        }
        return view
    }

    func updateNSView(_ nsView: PDFView, context: Context) {
        if nsView.document?.documentURL != url {
            nsView.document = PDFDocument(url: url)
        }
        guard let document = nsView.document,
              document.pageCount > 0,
              let currentPage = nsView.currentPage,
              let currentIndex = document.index(for: currentPage) as Int? else {
            return
        }
        let desiredIndex = max(0, min(currentPageIndex - 1, document.pageCount - 1))
        if currentIndex != desiredIndex, let page = document.page(at: desiredIndex) {
            nsView.go(to: page)
        }
    }

    static func dismantleNSView(_ nsView: PDFView, coordinator: Coordinator) {
        NotificationCenter.default.removeObserver(coordinator)
    }

    final class Coordinator: NSObject {
        @Binding var currentPageIndex: Int

        init(currentPageIndex: Binding<Int>) {
            _currentPageIndex = currentPageIndex
        }

        @objc func pageDidChange(_ notification: Notification) {
            guard let pdfView = notification.object as? PDFView,
                  let page = pdfView.currentPage,
                  let document = pdfView.document else { return }
            currentPageIndex = document.index(for: page) + 1
        }
    }
}
