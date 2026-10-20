@php
    $path = '/'.trim(request()->path(), '/');
    $path = $path === '//' ? '/' : $path;
    $page = config("seo.pages.{$path}");
    $indexable = $page !== null;
    $page ??= config('seo.private');
    $base = config('seo.url');
    $canonical = $base.($path === '/' ? '/' : $path);
    $image = $base.config('seo.og_image');
    $siteName = config('seo.site_name');
@endphp
<title>{{ $page['title'] }}</title>
<meta name="description" content="{{ $page['description'] }}">
<meta name="robots" content="{{ $indexable ? 'index, follow, max-image-preview:large, max-snippet:-1' : 'noindex, nofollow' }}">
<link rel="canonical" href="{{ $canonical }}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{{ $siteName }}">
<meta property="og:title" content="{{ $page['title'] }}">
<meta property="og:description" content="{{ $page['description'] }}">
<meta property="og:url" content="{{ $canonical }}">
<meta property="og:image" content="{{ $image }}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ $page['title'] }}">
<meta name="twitter:description" content="{{ $page['description'] }}">
<meta name="twitter:image" content="{{ $image }}">
<link rel="alternate" type="text/plain" href="{{ $base }}/llms.txt" title="llms.txt">
@if($indexable)
<script type="application/ld+json">
{!! json_encode([
    '@context' => 'https://schema.org',
    '@graph' => array_values(array_filter([
        [
            '@type' => 'WebSite',
            '@id' => $base.'/#website',
            'url' => $base.'/',
            'name' => $siteName,
            'description' => config('seo.description'),
            'inLanguage' => 'en',
        ],
        [
            '@type' => 'WebApplication',
            '@id' => $base.'/#app',
            'name' => $siteName,
            'url' => $base.'/',
            'description' => config('seo.description'),
            'applicationCategory' => 'DeveloperApplication',
            'operatingSystem' => 'Any (web browser)',
            'browserRequirements' => 'Requires JavaScript',
            'isAccessibleForFree' => true,
            'offers' => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'USD'],
            'availableLanguage' => config('seo.languages'),
            'featureList' => [
                'AI-generated follow-up questions',
                'User roles, AI agents, backend and frontend prompts',
                'Export as Markdown, JSON or AGENTS.md',
                'Shareable links',
                'Offline support (PWA)',
            ],
        ],
        $path === '/about' ? [
            '@type' => 'FAQPage',
            'mainEntity' => array_map(fn ($f) => [
                '@type' => 'Question',
                'name' => $f['q'],
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f['a']],
            ], config('seo.faq')),
        ] : null,
    ])),
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) !!}
</script>
@endif
