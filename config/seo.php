<?php

return [
    'url' => rtrim(env('SEO_URL', 'https://prompt-a-tool.com'), '/'),

    'site_name' => 'Prompt a Tool',

    'og_image' => '/og-image.png',

    'description' => 'Prompt a Tool is a free web app that turns your app idea into tailored development prompts, user roles, AI agents and skills. Answer a few AI-generated questions and get ready-to-use prompts for your backend and frontend.',

    'languages' => [
        'English', 'French', 'Arabic', 'Portuguese', 'Swahili', 'Hausa', 'Yoruba', 'Amharic', 'Luganda',
    ],

    // Public, indexable pages. `private` pages get noindex and stay out of the sitemap.
    'pages' => [
        '/' => [
            'title' => 'Prompt a Tool – Free AI Prompt Generator for Your App Idea',
            'description' => 'Describe your app idea, answer a few follow-up questions and get tailored prompts, user roles, AI agents and skills for building it. Free, multilingual and works offline.',
            'priority' => '1.0',
        ],
        '/about' => [
            'title' => 'About Prompt a Tool – How the App Prompt Generator Works',
            'description' => 'Learn how Prompt a Tool turns an app idea into user roles, AI agents, backend prompts and frontend prompts in three simple steps.',
            'priority' => '0.7',
        ],
        '/achievements' => [
            'title' => 'Achievements – Prompt a Tool',
            'description' => 'Unlock badges as you plan and generate prompts for your app ideas with Prompt a Tool.',
            'priority' => '0.3',
        ],
    ],

    'private' => [
        'title' => 'My Prompts – Prompt a Tool',
        'description' => 'Your saved prompts on Prompt a Tool.',
    ],

    'faq' => [
        [
            'q' => 'What is Prompt a Tool?',
            'a' => 'Prompt a Tool is a free web app that turns an app idea into a complete set of user roles, AI agents, backend prompts and frontend prompts, so you can start building with an AI coding assistant faster.',
        ],
        [
            'q' => 'How does Prompt a Tool work?',
            'a' => 'You describe your app idea in plain language, answer a few AI-generated follow-up questions, and receive tailored prompts for your project. You can then export them as Markdown, JSON or an AGENTS.md file.',
        ],
        [
            'q' => 'Is Prompt a Tool free?',
            'a' => 'Yes. Prompt a Tool is free to use and does not require an account to generate prompts. Signing in lets you save and revisit your prompts.',
        ],
        [
            'q' => 'Which languages does Prompt a Tool support?',
            'a' => 'English, French, Arabic (right-to-left), Portuguese, Swahili, Hausa, Yoruba, Amharic and Luganda.',
        ],
        [
            'q' => 'Does Prompt a Tool work offline?',
            'a' => 'Yes. It is a Progressive Web App that can be installed and opened offline. Generating new prompts needs a connection because the AI runs on the server.',
        ],
    ],
];
