<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <base href="{{viteTarget}}" />    
    <link rel="icon" href="{{data.config.prefix}}/public/favicon.png" />    
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ title }}</title>
    <script>
      window.addEventListener('vite:preloadError', function (event) {
        console.error(event);
      });
    </script>
  </head>