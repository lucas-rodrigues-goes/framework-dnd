#Requires AutoHotkey v2.0

GroupAdd("MapTool", "ahk_exe MapTool.exe")

#HotIf WinActive('ahk_group MapTool')

#SuspendExempt
Tab::Suspend(-1)
#SuspendExempt False

w::+F1
a::+F3
s::+F2
d::+F4

p::+F9
i::+F10
j::+F11
k::+F12