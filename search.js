/* Client-side demo search over search-index.json.
   The corpus itself is the CLI's Markdown archive; `chat_export.py search`
   works on the same files from the command line. */
(function () {
  'use strict';
  var input = document.getElementById('cep-search-input');
  var out = document.getElementById('cep-search-results');
  var count = document.getElementById('cep-search-count');
  var docs = [];

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function snippet(text, q) {
    var low = text.toLowerCase();
    var at = low.indexOf(q);
    if (at < 0) { return esc(text.slice(0, 160)) + '\u2026'; }
    var start = Math.max(0, at - 60);
    var end = Math.min(text.length, at + q.length + 100);
    var pre = esc(text.slice(start, at));
    var hit = esc(text.slice(at, at + q.length));
    var post = esc(text.slice(at + q.length, end));
    return (start > 0 ? '\u2026' : '') + pre + '<mark>' + hit + '</mark>' + post + (end < text.length ? '\u2026' : '');
  }

  function run() {
    var q = (input.value || '').trim().toLowerCase();
    if (!q) { count.textContent = 'Type a query to search the archive.'; out.innerHTML = ''; return; }
    var hits = [];
    for (var i = 0; i < docs.length; i++) {
      var hay = (docs[i].title + '\n' + docs[i].text).toLowerCase();
      if (hay.indexOf(q) !== -1) { hits.push(docs[i]); }
    }
    count.textContent = hits.length + ' conversation(s) matched "' + q + '".';
    out.innerHTML = hits.map(function (d) {
      return '<div class="cep-result"><a href="' + d.file + '"><strong>' + esc(d.title) + '</strong></a>' +
             '<div class="cep-file">' + esc(d.file) + '</div><div>' + snippet(d.text, q) + '</div></div>';
    }).join('');
  }

  function init(d) {
    docs = d.docs || [];
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) { input.value = q; }
    run();
  }

  if (input) {
    input.addEventListener('input', run);
    fetch('search-index.json').then(function (r) { return r.json(); }).then(init);
  }
})();
