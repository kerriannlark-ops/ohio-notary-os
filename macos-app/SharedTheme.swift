import SwiftUI

enum NotaryPalette {
    static let parchment = Color(red: 247 / 255, green: 241 / 255, blue: 234 / 255)
    static let mist = Color(red: 235 / 255, green: 226 / 255, blue: 222 / 255)
    static let roseDust = Color(red: 238 / 255, green: 219 / 255, blue: 214 / 255)
    static let ink = Color(red: 40 / 255, green: 26 / 255, blue: 28 / 255)
    static let walnut = Color(red: 84 / 255, green: 62 / 255, blue: 64 / 255)
    static let oxblood = Color(red: 126 / 255, green: 31 / 255, blue: 43 / 255)
    static let deepRed = Color(red: 155 / 255, green: 45 / 255, blue: 58 / 255)
    static let brass = Color(red: 179 / 255, green: 139 / 255, blue: 84 / 255)
    static let sage = Color(red: 212 / 255, green: 226 / 255, blue: 214 / 255)
    static let backgroundTop = Color(red: 252 / 255, green: 247 / 255, blue: 242 / 255)
    static let backgroundBottom = Color(red: 244 / 255, green: 236 / 255, blue: 233 / 255)
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
        case .blocked: return NotaryPalette.deepRed.opacity(0.12)
        case .active: return NotaryPalette.oxblood.opacity(0.12)
        }
    }

    var foreground: Color {
        switch self {
        case .neutral: return NotaryPalette.ink
        case .success: return Color(red: 54 / 255, green: 103 / 255, blue: 73 / 255)
        case .warning: return NotaryPalette.ink
        case .blocked: return NotaryPalette.deepRed
        case .active: return NotaryPalette.oxblood
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
            .background(.white.opacity(0.84))
            .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .stroke(NotaryPalette.oxblood.opacity(0.10), lineWidth: 1)
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
                .foregroundStyle(NotaryPalette.oxblood.opacity(0.82))
            Text(title)
                .font(.notarySerif(26, weight: .semibold))
                .foregroundStyle(NotaryPalette.ink)
            if let subtitle, !subtitle.isEmpty {
                Text(subtitle)
                    .font(.notarySerif(15))
                    .foregroundStyle(NotaryPalette.walnut.opacity(0.92))
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
            .background(NotaryPalette.oxblood.opacity(configuration.isPressed ? 0.82 : 1))
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
            .background(.white.opacity(configuration.isPressed ? 0.9 : 0.75))
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(NotaryPalette.oxblood.opacity(0.12), lineWidth: 1)
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
