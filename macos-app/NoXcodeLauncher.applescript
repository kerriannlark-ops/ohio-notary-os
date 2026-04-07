on run
	set appPath to POSIX path of (path to me)
	set resourcesPath to appPath & "Contents/Resources"
	set launchScript to resourcesPath & "/launch_regular_app.py"
	set webAppPath to resourcesPath & "/WebApp"
	set commandText to "/usr/bin/python3 " & quoted form of launchScript & " " & quoted form of webAppPath
	do shell script commandText
end run
