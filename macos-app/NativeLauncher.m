#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>

@interface AppDelegate : NSObject <NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate>
@property (strong) NSWindow *window;
@property (strong) WKWebView *webView;
@property (strong) NSURL *localWorkspaceURL;
@end

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)notification {
  (void)notification;
  [self setupMenu];
  [NSApp activateIgnoringOtherApps:YES];

  NSString *resourcePath = [[NSBundle mainBundle] resourcePath];
  NSString *pythonPath = @"/usr/bin/python3";
  NSString *helperPath = [resourcePath stringByAppendingPathComponent:@"launch_regular_app.py"];
  NSString *webDir = [resourcePath stringByAppendingPathComponent:@"WebApp"];

  NSError *launchError = nil;
  NSString *urlString = [self preparedWorkspaceURLWithPython:pythonPath helper:helperPath webDir:webDir error:&launchError];
  if (launchError != nil || urlString.length == 0) {
    [self presentLaunchError:launchError];
    [NSApp terminate:nil];
    return;
  }

  self.localWorkspaceURL = [NSURL URLWithString:urlString];
  if (self.localWorkspaceURL == nil) {
    NSError *urlError = [NSError errorWithDomain:@"NotaryOSStudyHub"
                                            code:1003
                                        userInfo:@{NSLocalizedDescriptionKey: @"The local workspace URL was invalid."}];
    [self presentLaunchError:urlError];
    [NSApp terminate:nil];
    return;
  }

  WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];
  configuration.preferences.javaScriptCanOpenWindowsAutomatically = YES;
  self.webView = [[WKWebView alloc] initWithFrame:NSZeroRect configuration:configuration];
  self.webView.navigationDelegate = self;
  self.webView.UIDelegate = self;
  self.webView.autoresizingMask = NSViewWidthSizable | NSViewHeightSizable;

  NSRect frame = NSMakeRect(120, 80, 1440, 980);
  NSUInteger style = NSWindowStyleMaskTitled |
                     NSWindowStyleMaskClosable |
                     NSWindowStyleMaskMiniaturizable |
                     NSWindowStyleMaskResizable;
  self.window = [[NSWindow alloc] initWithContentRect:frame
                                            styleMask:style
                                              backing:NSBackingStoreBuffered
                                                defer:NO];
  self.window.title = @"Notary OS Study Hub";
  self.window.tabbingMode = NSWindowTabbingModeDisallowed;
  [self.window center];
  [self.window setContentView:self.webView];
  [self.window makeKeyAndOrderFront:nil];
  [self.webView loadRequest:[NSURLRequest requestWithURL:self.localWorkspaceURL]];
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication *)sender {
  (void)sender;
  return YES;
}

- (void)setupMenu {
  NSMenu *menuBar = [[NSMenu alloc] init];
  NSMenuItem *appMenuItem = [[NSMenuItem alloc] init];
  [menuBar addItem:appMenuItem];
  [NSApp setMainMenu:menuBar];

  NSMenu *appMenu = [[NSMenu alloc] init];
  NSString *appName = [[NSProcessInfo processInfo] processName];
  NSString *quitTitle = [NSString stringWithFormat:@"Quit %@", appName];
  NSMenuItem *quitItem = [[NSMenuItem alloc] initWithTitle:quitTitle
                                                    action:@selector(terminate:)
                                             keyEquivalent:@"q"];
  [appMenu addItem:quitItem];
  [appMenuItem setSubmenu:appMenu];
}

- (NSString *)preparedWorkspaceURLWithPython:(NSString *)pythonPath
                                      helper:(NSString *)helperPath
                                      webDir:(NSString *)webDir
                                       error:(NSError **)error {
  if (![[NSFileManager defaultManager] fileExistsAtPath:pythonPath]) {
    if (error != NULL) {
      *error = [NSError errorWithDomain:@"NotaryOSStudyHub"
                                   code:1001
                               userInfo:@{NSLocalizedDescriptionKey: @"Python 3 was not found at /usr/bin/python3."}];
    }
    return nil;
  }

  NSTask *task = [[NSTask alloc] init];
  task.launchPath = pythonPath;
  task.arguments = @[helperPath, @"--server-only", webDir];

  NSPipe *stdoutPipe = [NSPipe pipe];
  NSPipe *stderrPipe = [NSPipe pipe];
  task.standardOutput = stdoutPipe;
  task.standardError = stderrPipe;

  @try {
    [task launch];
  } @catch (NSException *exception) {
    if (error != NULL) {
      *error = [NSError errorWithDomain:@"NotaryOSStudyHub"
                                   code:1002
                               userInfo:@{NSLocalizedDescriptionKey: exception.reason ?: @"Failed to launch the local workspace helper."}];
    }
    return nil;
  }

  [task waitUntilExit];
  NSData *stdoutData = [[stdoutPipe fileHandleForReading] readDataToEndOfFile];
  NSData *stderrData = [[stderrPipe fileHandleForReading] readDataToEndOfFile];

  NSString *stdoutString = [[NSString alloc] initWithData:stdoutData encoding:NSUTF8StringEncoding] ?: @"";
  NSString *stderrString = [[NSString alloc] initWithData:stderrData encoding:NSUTF8StringEncoding] ?: @"";
  NSString *trimmedOutput = [stdoutString stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];

  if (task.terminationStatus != 0 || trimmedOutput.length == 0) {
    NSString *message = stderrString.length > 0 ? stderrString : @"The local workspace helper did not return a URL.";
    if (error != NULL) {
      *error = [NSError errorWithDomain:@"NotaryOSStudyHub"
                                   code:1004
                               userInfo:@{NSLocalizedDescriptionKey: message}];
    }
    return nil;
  }

  return trimmedOutput;
}

- (BOOL)isLocalWorkspaceURL:(NSURL *)url {
  if (url == nil) {
    return NO;
  }
  NSString *host = url.host.lowercaseString ?: @"";
  return [url.scheme.lowercaseString isEqualToString:@"http"] && [host isEqualToString:@"127.0.0.1"];
}

- (void)presentLaunchError:(NSError *)error {
  NSAlert *alert = [[NSAlert alloc] init];
  alert.alertStyle = NSAlertStyleCritical;
  alert.messageText = @"Notary OS Study Hub could not open.";
  alert.informativeText = error.localizedDescription ?: @"Unknown launch error.";
  [alert addButtonWithTitle:@"OK"];
  [alert runModal];
}

- (void)webView:(WKWebView *)webView
decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction
decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler {
  (void)webView;
  NSURL *targetURL = navigationAction.request.URL;

  BOOL shouldOpenExternally = navigationAction.navigationType == WKNavigationTypeLinkActivated &&
                              ![self isLocalWorkspaceURL:targetURL];
  if (shouldOpenExternally) {
    [[NSWorkspace sharedWorkspace] openURL:targetURL];
    decisionHandler(WKNavigationActionPolicyCancel);
    return;
  }

  decisionHandler(WKNavigationActionPolicyAllow);
}

- (WKWebView *)webView:(WKWebView *)webView
createWebViewWithConfiguration:(WKWebViewConfiguration *)configuration
   forNavigationAction:(WKNavigationAction *)navigationAction
        windowFeatures:(WKWindowFeatures *)windowFeatures {
  (void)webView;
  (void)configuration;
  (void)windowFeatures;

  NSURL *targetURL = navigationAction.request.URL;
  if ([self isLocalWorkspaceURL:targetURL]) {
    [self.webView loadRequest:[NSURLRequest requestWithURL:targetURL]];
  } else if (targetURL != nil) {
    [[NSWorkspace sharedWorkspace] openURL:targetURL];
  }
  return nil;
}

@end

int main(int argc, const char * argv[]) {
  (void)argc;
  (void)argv;
  @autoreleasepool {
    [NSApplication sharedApplication];
    AppDelegate *delegate = [[AppDelegate alloc] init];
    [NSApp setDelegate:delegate];
    [NSApp run];
  }
  return 0;
}
