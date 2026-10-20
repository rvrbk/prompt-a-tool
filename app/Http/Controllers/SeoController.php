<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class SeoController extends Controller
{
    public function sitemap(): Response
    {
        $base = config('seo.url');
        $lastmod = now()->toDateString();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n".'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
        foreach (config('seo.pages') as $path => $page) {
            $loc = $base.($path === '/' ? '/' : $path);
            $xml .= "  <url><loc>{$loc}</loc><lastmod>{$lastmod}</lastmod><priority>{$page['priority']}</priority></url>\n";
        }
        $xml .= '</urlset>'."\n";

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }
}
