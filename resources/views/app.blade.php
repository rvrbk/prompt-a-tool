<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    @if(env('VITE_GA_MEASUREMENT_ID'))
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ env('VITE_GA_MEASUREMENT_ID') }}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', '{{ env("VITE_GA_MEASUREMENT_ID") }}');
    </script>
    @endif
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#1B1B18">
    <meta name="background-color" content="#FDFDFC">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="manifest" href="/manifest.webmanifest">
    @include('partials.seo')
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="apple-touch-icon" href="/favicon.ico">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.6.6/css/flag-icons.min.css" />
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <div id="app">
        {{-- Static fallback for crawlers and LLM fetchers that do not run JavaScript. Replaced when Vue mounts. --}}
        <main style="max-width:42rem;margin:2rem auto;padding:0 1rem;font-family:sans-serif">
            <h1>Prompt a Tool – free AI prompt generator for your app idea</h1>
            <p>{{ config('seo.description') }}</p>
            <h2>How it works</h2>
            <ol>
                <li>Describe your app idea in plain language.</li>
                <li>Answer a few AI-generated follow-up questions.</li>
                <li>Get user roles, AI agents, backend prompts and frontend prompts tailored to your project.</li>
            </ol>
            <h2>Frequently asked questions</h2>
            @foreach(config('seo.faq') as $item)
                <h3>{{ $item['q'] }}</h3>
                <p>{{ $item['a'] }}</p>
            @endforeach
            <noscript><p>Prompt a Tool needs JavaScript enabled to run.</p></noscript>
        </main>
    </div>
</body>
</html>
