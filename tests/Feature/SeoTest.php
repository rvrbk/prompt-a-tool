<?php

namespace Tests\Feature;

use Tests\TestCase;

class SeoTest extends TestCase
{
    public function test_home_has_meta_canonical_and_json_ld(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('<link rel="canonical" href="https://prompt-a-tool.com/">', false)
            ->assertSee('property="og:title"', false)
            ->assertSee('"@type":"WebApplication"', false)
            ->assertSee('index, follow', false);
    }

    public function test_about_includes_faq_schema(): void
    {
        $this->get('/about')->assertOk()->assertSee('"@type":"FAQPage"', false);
    }

    public function test_account_pages_are_noindex(): void
    {
        $this->get('/account/prompts')->assertOk()->assertSee('noindex, nofollow', false);
    }

    public function test_unknown_paths_return_404(): void
    {
        $this->get('/does-not-exist')->assertNotFound();
    }

    public function test_sitemap_lists_public_pages(): void
    {
        $this->get('/sitemap.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee('<loc>https://prompt-a-tool.com/about</loc>', false)
            ->assertDontSee('/account', false);
    }
}
