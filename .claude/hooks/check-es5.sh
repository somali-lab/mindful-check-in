#!/usr/bin/env bash
# PostToolUse(Write|Edit) hook: warn when an edited source file uses ES6+ syntax.
# This repo requires ES5 in lib/, modules/, data/, and boot.js.
f=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$f" ] && exit 0
fn=$(printf '%s' "$f" | tr '\\' '/')
case "$fn" in
  */lib/*.js|*/modules/*.js|*/data/*.js|*/boot.js|lib/*.js|modules/*.js|data/*.js|boot.js) ;;
  *) exit 0 ;;
esac
[ -f "$fn" ] || exit 0
hits=$(grep -nE '\b(const|let|class)\b|\b(import|export)\b|=>|`' "$fn" | head -8)
[ -z "$hits" ] && exit 0
jq -n --arg h "$hits" --arg p "$fn" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:("ES5 CONSTRAINT — " + $p + " appears to use ES6+ syntax (const/let/class/import/export/arrow =>/template literals `). This repo requires ES5 in lib/, modules/, data/, boot.js. Review these lines and rewrite as ES5:\n" + $h)}}'
