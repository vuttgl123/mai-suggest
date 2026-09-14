const fs = require('fs');
let content = fs.readFileSync('src/features/catalogue/presentation/catalogue-engagement-panel.tsx', 'utf8');

content = content.replace(/await postItemComment\(engagement\.id, newComment\)/g, 'await createItemCommentAction({ itemId: engagement.id, content: newComment })');
content = content.replace(/await editItemComment\(engagement\.id, commentId, editingContent\)/g, 'await updateMyItemCommentAction({ commentId, content: editingContent })');
content = content.replace(/await removeItemComment\(engagement\.id, commentId\)/g, 'await deleteItemCommentAction(commentId)');

// Also make sure result.success and result.code are updated to result.ok and result.error.code
content = content.replace(/result\.success/g, 'result.ok');
content = content.replace(/result\.code/g, 'result.error.code');

fs.writeFileSync('src/features/catalogue/presentation/catalogue-engagement-panel.tsx', content, 'utf8');
console.log('Fixed actions!');
