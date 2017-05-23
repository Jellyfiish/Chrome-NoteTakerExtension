chrome.storage.local.get('changes', function(results) {
  var changes = results.changes;

  // Unhighlight all notes
  $('.noted-highlight').each(function() {
    // clone contents of span element
    let newNode = this.childNodes[0].cloneNode();
    // replace span with it's contents
    let parentNode = this.parentNode;
    parentNode.replaceChild(newNode, this);
    parentNode.normalize();
  });

  changes.textToHighlight.forEach((value) => {
    // get range object from note
    let noteRange = JSON.parse(value.range);
    // recreate range object from original selection
    let range = document.createRange();
    // find original startContainer hopefully
    // below code snippet adapted from this stack overflow answer: http://stackoverflow.com/a/4399718/4869225
    let startNode = $('body').find(":not(iframe)").addBack().contents().filter(function() {
        return (this.nodeType == 3 && this.data === noteRange.startContainer);
    });
    startNode = startNode[0];
    // find original endContainer hopefully
    let endNode = $('body').find(":not(iframe)").addBack().contents().filter(function() {
        return (this.nodeType == 3 && this.data === noteRange.endContainer);
    });
    endNode = endNode[0];
    // set start and end of new range
    range.setStart(startNode, noteRange.startOffset);
    range.setEnd(endNode, noteRange.endOffset);

    // var range = window.getSelection().getRangeAt(0);
    contents = range.extractContents();

    // recursively find an encase all text nodes in the range with span tags
    var traverseNodes = function(node) {
      node.childNodes.forEach(childNode => {
        if (childNode.nodeType === 3) {
          let newNode = document.createElement('span');
          // newNode.style.backgroundColor = "yellow";
          newNode.className += `noted-highlight highlight-${value.color}`;
          newNode.appendChild(childNode.cloneNode());
          childNode.parentNode.replaceChild(newNode, childNode);
        } else {
         traverseNodes(childNode);
        }
      });
    };

    traverseNodes(contents);
    range.insertNode(contents);
  });

  chrome.storage.local.remove('changes');
});
