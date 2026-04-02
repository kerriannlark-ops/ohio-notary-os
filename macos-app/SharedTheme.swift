import SwiftUI

enum NotaryPalette {
    static let parchment = Color(red: 247 / 255, green: 244 / 255, blue: 237 / 255)
    static let mist = Color(red: 232 / 255, green: 239 / 255, blue: 243 / 255)
    static let sage = Color(red: 223 / 255, green: 232 / 255, blue: 223 / 255)
    static let ink = Color(red: 31 / 255, green: 45 / 255, blue: 53 / 255)
    static let walnut = Color(red: 65 / 255, green: 82 / 255, blue: 90 / 255)
    static let teal = Color(red: 59 / 255, green: 107 / 255, blue: 103 / 255)
    static let blue = Color(red: 52 / 255, green: 106 / 255, blue: 137 / 255)
    static let rust = Color(red: 181 / 255, green: 110 / 255, blue: 92 / 255)
    static let brass = Color(red: 199 / 255, green: 160 / 255, blue: 98 / 255)
    static let backgroundTop = Color(red: 251 / 255, green: 248 / 255, blue: 242 / 255)
    static let backgroundBottom = Color(red: 237 / 255, green: 243 / 255, blue: 245 / 255)
}

enum NotaryStatusTone {
    case neutral
    case success
    case warning
    case blocked
    case active

    var background: Color {
        switch self {
        case .neutral: return NotaryPalette.mist
        case .success: return NotaryPalette.sage
        case .warning: return NotaryPalette.brass.opacity(0.16)
        case .blocked: return NotaryPalette.rust.opacity(0.12)
        case .active: return NotaryPalette.blue.opacity(0.12)
        }
    }

    var foreground: Color {
        switch self {
        case .neutral: return NotaryPalette.ink
        case .success: return NotaryPalette.teal
        case .warning: return NotaryPalette.ink
        case .blocked: return NotaryPalette.rust
        case .active: return NotaryPalette.blue
        }
    }

    var border: Color {
        foreground.opacity(0.22)
    }
}

extension Font {
    static func notarySerif(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .custom("Times New Roman", size: size).weight(weight)
    }
}

struct NotaryCardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(18)
            .background(.white.opacity(0.82))
            .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .stroke(NotaryPalette.blue.opacity(0.10), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.06), radius: 18, x: 0, y: 12)
    }
}

extension View {
    func notaryCard() -> some View {
        modifier(NotaryCardModifier())
    }
}

struct NotaryStatusBadge: View {
    let label: String
    let tone: NotaryStatusTone

    var body: some View {
        Text(label)
            .font(.notarySerif(11, weight: .semibold))
            .tracking(0.8)
            .textCase(.uppercase)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(tone.background)
            .foregroundStyle(tone.foreground)
            .clipShape(Capsule())
            .overlay(Capsule().stroke(tone.border, lineWidth: 1))
    }
}

struct SectionTitle: View {
    let eyebrow: String
    let title: String
    let subtitle: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(eyebrow)
                .font(.notarySerif(11, weight: .semibold))
                .tracking(1.2)
                .textCase(.uppercase)
                .foregroundStyle(NotaryPalette.blue.opacity(0.78))
            Text(title)
                .font(.notarySerif(26, weight: .semibold))
                .foregroundStyle(NotaryPalette.ink)
            if let subtitle, !subtitle.isEmpty {
                Text(subtitle)
                    .font(.notarySerif(15))
                    .foregroundStyle(NotaryPalette.walnut.opacity(0.9))
                    .lineSpacing(2)
            }
        }
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.notarySerif(15, weight: .semibold))
            .foregroundStyle(.white)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(NotaryPalette.blue.opacity(configuration.isPressed ? 0.82 : 1))
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .scaleEffect(configuration.isPressed ? 0.99 : 1)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.notarySerif(15, weight: .semibold))
            .foregroundStyle(NotaryPalette.ink)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(.white.opacity(configuration.isPressed ? 0.92 : 0.72))
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(NotaryPalette.blue.opacity(0.12), lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.99 : 1)
    }
}

struct NotaryBackground: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(
                LinearGradient(
                    colors: [NotaryPalette.backgroundTop, NotaryPalette.backgroundBottom],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
    }
}

extension View {
    func notaryBackground() -> some View {
        modifier(NotaryBackground())
    }
}
