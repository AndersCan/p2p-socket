# Source code for the VHS readme example.
#
# To run:
#
#     vhs < readme.tape

# Output tapes/output/readme.gif
Output tapes/output/readme.mp4

Set TypingSpeed 75ms
Set FontSize 24
Set Width 1280
Set Height 720

Hide
Type "# Will share localhost:8080 with internet"
Show
Sleep 1s
Type "npx p2p-socket share --port 3000"
Sleep 2s

Hide
Ctrl+C
Type "# Connect to remote localhost:8080 over internet"
Show

Sleep 1s
Type@10ms "npx p2p-socket connect --port 3000 --remote-key 1c6ba7eb53599d08c366821fbab3586a1f984b54528cc82112b62e449657cfbf"
Sleep 500ms
Enter

Sleep 2s
# 
# Sleep 2s
# 
# Type "Welcome to VHS!"
# 
# Sleep 1
# 
# Space
# 
# Type "A tool for generating terminal GIFs from code."
# 
# Sleep 5s