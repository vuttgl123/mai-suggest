const fs = require('fs');
const content = fs.readFileSync('src/features/catalogue/presentation/catalogue-engagement-panel.tsx', 'utf8');
const lines = content.split('\n');

const lastImportsIndex = lines.findLastIndex(line => line.includes('import { Button }'));

if (lastImportsIndex > 100) {
  let result = lines.slice(0, lastImportsIndex - 1).join('\n') + '\n';
  result += '      setConfirmingCommentId(null);\n      setFeedback("Lời bình đã được gỡ.");\n      router.refresh();\n    });\n  }\n\n';
  result += '  return (\n    <div className="space-y-8">\n      <div className="grid gap-8 lg:grid-cols-[minmax(17rem,0.74fr)_minmax(0,1.26fr)] lg:gap-10">\n        <RatingForm\n          isPending={isPending}\n          note={note}\n          onDelete={myRating ? deleteRating : undefined}\n          onNoteChange={setNote}\n          onScoreChange={setScore}\n          onSubmit={saveRating}\n          score={score}\n        />\n        <RatingList ratings={engagement.ratings} />\n      </div>\n\n      <CommentList\n        actorId={actorId}\n        canManage={canManage}\n        engagement={engagement}\n      />\n    </div>\n  );\n}\n\n';

  const commentListStart = lines.findIndex((line, idx) => idx > lastImportsIndex && line.startsWith('function CommentList({'));
  
  if (commentListStart !== -1) {
    result += lines.slice(commentListStart).join('\n');
    fs.writeFileSync('src/features/catalogue/presentation/catalogue-engagement-panel.tsx', result, 'utf8');
    console.log("Fixed!");
  } else {
    console.log("Could not find CommentList!");
  }
} else {
  console.log("Not corrupted in the expected way");
}
