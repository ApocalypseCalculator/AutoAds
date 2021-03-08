@echo off
Title File Browse Dialog
(
    echo Function GetFileDlgEx(sIniDir,sFilter,sTitle^) 
    echo Set oDlg = CreateObject("WScript.Shell"^).Exec("mshta.exe ""about:<object id=d classid=clsid:3050f4e1-98b5-11cf-bb82-00aa00bdce0b></object><script>moveTo(0,-9999);eval(new ActiveXObject('Scripting.FileSystemObject').GetStandardStream(0).Read("^&Len(sIniDir^)^+Len(sFilter^)^+Len(sTitle^)+41^&"));function window.onload(){var p=/[^\0]*/;new ActiveXObject('Scripting.FileSystemObject').GetStandardStream(1).Write(p.exec(d.object.openfiledlg(iniDir,null,filter,title)));close();}</script><hta:application showintaskbar=no />"""^) 
    echo oDlg.StdIn.Write "var iniDir='" ^& sIniDir ^& "';var filter='" ^& sFilter ^& "';var title='" ^& sTitle ^& "';" 
    echo GetFileDlgEx = oDlg.StdOut.ReadAll 
    echo End Function
    echo sIniDir = "C:\MyFile.exe" 
    echo sFilter = "EXE files (*.exe)|*.exe|" 
    echo sTitle = "Select your Chrome/Chromium executable" 
    echo MyFile = GetFileDlgEx(Replace(sIniDir,"\","\\"^),sFilter,sTitle^) 
    echo wscript.echo MyFile
)>"%tmp%\%~n0.vbs"
for /f "tokens=* delims=" %%p in ('Cscript /NoLogo "%tmp%\%~n0.vbs"') do set "file=%%p"
echo %file%