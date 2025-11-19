#Requires AutoHotkey v2.0

; Only apply to MapTool.exe
GroupAdd("MapTool", "ahk_exe MapTool.exe")
#HotIf WinActive("ahk_group MapTool")

; Tab to disable/enable hotkeys
#SuspendExempt
+Tab::Suspend(-1)
#SuspendExempt False

; Repeat Key
repeat_key(key, fn) {
    while GetKeyState(key, "P") {
        Send("+{" fn "}")     ; Shift + Fn key
        Sleep(350)
    }
}

; Hold (WASD)
w::repeat_key("w", "F1")
a::repeat_key("a", "F2")
s::repeat_key("s", "F3")
d::repeat_key("d", "F4")

; Others
p::Send("+{F9}")
i::Send("+{F10}")
j::Send("+{F11}")
k::Send("+{F12}")