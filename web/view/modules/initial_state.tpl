<script type="text/template" id="__INITIAL_STATE__">
    {{ data | dump | safe }}
  </script>
<script>
  var __INITIAL_STATE__ = { "config": { "prefix": "" },  "title": "" };
  try { 
    (function(){
      const tag = document.getElementById('__INITIAL_STATE__');      
      __INITIAL_STATE__ = JSON.parse(tag.innerHTML);
    })();
  }
  catch (e) {
  }
  // 动态加载入口
  function __vitejs_load_entry(url, type) {        
        if(!url) return;
        if(url.indexOf('/') !== 0) url = '/' + url;
        var prefix = (window.__INITIAL_STATE__ && window.__INITIAL_STATE__.config && window.__INITIAL_STATE__.config.prefix) || '';
        if(prefix && url.indexOf(prefix) !== 0) {
          url = prefix + url;
        }   
        var nodeObj; 
        switch(type) {
          case 'script': {
            // 检查是否已加载过
            var existing = document.querySelector(`script[src="${url}"]`);   
            if(existing) return; 
            nodeObj = document.createElement('script');
            nodeObj.src = url;
            nodeObj.type = 'module';
            break;
          }
          case 'stylesheet': 
          case 'modulepreload':
          case 'icon':  {
            // 检查是否已加载过
            var existing = document.querySelector(`link[href="${url}"]`);   
            if(existing) return; 
            nodeObj = document.createElement('link');
            nodeObj.href = url;
            nodeObj.rel = type;
            break;
          }
        }  
        if(!nodeObj) return;     
        nodeObj.crossOrigin = 'crossorigin';
        document.head.appendChild(nodeObj);
      }
</script>