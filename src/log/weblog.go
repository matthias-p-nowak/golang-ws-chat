package log

import (
	"fmt"
	"runtime"
	"strings"
	"time"
)

var (
	skipLength int = 0
)

func init() {
	pc := make([]uintptr, 1)
	runtime.Callers(1, pc)
	frames := runtime.CallersFrames(pc)
	frame, _ := frames.Next()
	skipLength = strings.Index(frame.File, "/src/log/weblog")
	fmt.Printf("skipLength: %d\n", skipLength)
}

// Log prints a log message with the current time, source file, line number, and the function name that called Log.
// The format is:
//
//	<time> <sourcefile>:<line> <functionname> <message>
//
// The source file path is relative to the current working directory.
func Log(s string) {
	time := time.Now().Format("2006-01-02 15:04:05.000")
	pc := make([]uintptr, 1)
	runtime.Callers(2, pc)
	frames := runtime.CallersFrames(pc)
	frame, _ := frames.Next()
	file := "." + frame.File[skipLength:]
	fmt.Printf("%s %s:%d %s %s\n", time, file, frame.Line, frame.Function, s)
}
