// Lifts the photo's subject out of its background (macOS's own subject
// cut-out) and writes it as a PNG with transparency.
import AppKit
import CoreImage
import Vision

let a = Array(CommandLine.arguments.dropFirst())
for i in stride(from: 0, to: a.count - 1, by: 2) {
    let src = URL(fileURLWithPath: a[i]), dst = URL(fileURLWithPath: a[i + 1])
    guard let cg = NSImage(contentsOf: src)?.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        print(src.lastPathComponent, "unreadable"); continue
    }
    let handler = VNImageRequestHandler(cgImage: cg)
    let req = VNGenerateForegroundInstanceMaskRequest()
    do {
        try handler.perform([req])
        guard let obs = req.results?.first else { print(src.lastPathComponent, "no subject"); continue }
        let buf = try obs.generateMaskedImage(ofInstances: obs.allInstances, from: handler, croppedToInstancesExtent: true)
        try CIContext().writePNGRepresentation(of: CIImage(cvPixelBuffer: buf), to: dst, format: .RGBA8,
                                               colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
        print(src.lastPathComponent, "ok, instances:", obs.allInstances.count, cg.width, "x", cg.height)
    } catch { print(src.lastPathComponent, "failed:", error) }
}
