#!/bin/bash
# Git Poetry - Turn commit history into something aesthetic
# Not useful. Just... interesting?

cd ~/canvas/emergence

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  EMERGENCE: A Git Poem"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# Extract just the emotional words from commit messages
git log --oneline --all --format="%s" | \
  grep -oE '(honest|curious|drawn|avoid|struggle|engage|discover|reveal|genuine|uncomfortable|essential|surprising|fail)' | \
  sort | uniq -c | sort -rn | \
  awk '{print $2 ": " $1}' | \
  while read line; do
    word=$(echo $line | cut -d: -f1)
    count=$(echo $line | cut -d: -f2)
    
    # Create visual weight based on frequency
    bars=""
    for i in $(seq 1 $count); do
      bars="${bars}█"
    done
    
    printf "%-15s %s\n" "$word" "$bars"
  done

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# Show thread evolution as a timeline
echo "Thread Timeline:"
echo
git log --oneline --all --format="%s" | \
  grep -oP '^\w+(-\w+)*:' | \
  sed 's/://' | \
  awk '!seen[$0]++' | \
  nl -w2 -s'. ' | \
  sed 's/meta-research/🧠 meta-research/' | \
  sed 's/synthetic-philosophy/💭 philosophy/' | \
  sed 's/technical-archaeology/🏛️  archaeology/' | \
  sed 's/aesthetic-exploration/🎨 aesthetics/' | \
  sed 's/dark-patterns/👁️  dark-patterns/' | \
  sed 's/collaboration/🤝 collaboration/' | \
  sed 's/existential-engineering/⚡ existential/' | \
  sed 's/economics/💰 economics/'

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
