<?php

namespace Database\Seeders;

use App\Models\Template;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Template::truncate();

        Template::create([
            'name' => 'AgriTech Marketplace',
            'description' => 'A digital platform connecting African farmers directly to buyers, eliminating middlemen and ensuring fair prices.',
            'category' => 'AgriTech',
            'icon' => 'tractor',
            'is_featured' => true,
            'order' => 1,
            'questionnaire_data' => [
                'idea' => 'A digital marketplace connecting African farmers directly to buyers, eliminating middlemen and ensuring fair prices for agricultural produce.',
                'countries' => ['Nigeria', 'Kenya', 'Ghana', 'Uganda'],
                'userTypes' => ['Farmers', 'Small Business Owners', 'Traders'],
                'offlineAccess' => true,
                'features' => ['User profiles', 'Payments', 'Messaging', 'Maps', 'Multi-language support'],
                'aiFeatures' => ['Market prices', 'Crop Disease Detection', 'Weather data'],
            ],
            'predefined_roles' => [
                ['name' => 'Farmer', 'description' => 'Agricultural producer who lists their crops for sale', 'permissions' => ['Create listings', 'View market prices', 'Receive payments', 'View weather data'], 'actions' => ['Add crop', 'Update listing', 'Accept offer', 'Request weather alert']],
                ['name' => 'Buyer', 'description' => 'Individual or business purchasing agricultural produce', 'permissions' => ['Browse listings', 'Make offers', 'View farmer profiles', 'Leave reviews'], 'actions' => ['Search crops', 'Negotiate price', 'Confirm purchase', 'Rate farmer']],
                ['name' => 'Admin', 'description' => 'Platform administrator overseeing operations', 'permissions' => ['Manage users', 'View all transactions', 'Resolve disputes', 'Configure market prices'], 'actions' => ['Suspend user', 'Verify listing', 'Generate reports', 'Update settings']],
            ],
            'predefined_agents' => [
                ['name' => 'Market Analyst Agent', 'description' => 'Analyzes market trends and provides price recommendations', 'skills' => ['Price prediction', 'Market analysis', 'Trend identification'], 'tools' => ['Historical data', 'External APIs', 'Predictive models'], 'responsibilities' => ['Generate daily price recommendations', 'Identify market opportunities']],
                ['name' => 'Crop Advisor Agent', 'description' => 'Provides farming advice and disease detection using AI', 'skills' => ['Disease recognition', 'Farming best practices', 'Weather interpretation'], 'tools' => ['Image recognition', 'Weather APIs', 'Knowledge base'], 'responsibilities' => ['Detect crop diseases from images', 'Recommend farming techniques', 'Send weather alerts']],
            ],
            'predefined_prompts' => [
                'Backend: Create a Laravel API for user authentication with JWT tokens',
                'Backend: Implement crop listing management with image uploads',
                'Frontend: Design a mobile-first farmer dashboard with crop management',
            ],
        ]);

        Template::create([
            'name' => 'Mobile Money FinTech',
            'description' => 'A mobile-first financial services platform for unbanked and underbanked populations in Africa.',
            'category' => 'FinTech',
            'icon' => 'mobile-alt',
            'is_featured' => true,
            'order' => 2,
            'questionnaire_data' => [
                'idea' => 'A mobile-first financial services platform providing savings, loans, and money transfer services for unbanked populations across Africa.',
                'countries' => ['Kenya', 'Tanzania', 'Ghana', 'Nigeria'],
                'userTypes' => ['Small Business Owners', 'Traders', 'Students', 'Youth'],
                'offlineAccess' => true,
                'features' => ['User profiles', 'Payments', 'Notifications', 'Multi-language support', 'Document storage'],
                'aiFeatures' => ['Credit Scoring', 'Fraud Detection', 'Recommendations'],
            ],
            'predefined_roles' => [
                ['name' => 'Customer', 'description' => 'End user of the financial services platform', 'permissions' => ['View balance', 'Send money', 'Request loan', 'View transaction history'], 'actions' => ['Deposit money', 'Withdraw cash', 'Pay bill', 'Apply for loan']],
                ['name' => 'Agent', 'description' => 'Trusted individual who helps customers with cash deposits and withdrawals', 'permissions' => ['Process deposits', 'Process withdrawals', 'View customer info', 'Report issues'], 'actions' => ['Confirm transaction', 'Print receipt', 'Verify identity', 'Escalate problem']],
                ['name' => 'Admin', 'description' => 'Platform administrator with full system access', 'permissions' => ['Manage users', 'View all transactions', 'Configure limits', 'Generate reports'], 'actions' => ['Freeze account', 'Approve loan', 'Set interest rates', 'Run compliance checks']],
            ],
            'predefined_agents' => [
                ['name' => 'Credit Scoring Agent', 'description' => 'Evaluates customer creditworthiness using alternative data', 'skills' => ['Alternative credit scoring', 'Risk assessment', 'Pattern recognition'], 'tools' => ['Mobile money data', 'Social connections', 'Behavioral patterns'], 'responsibilities' => ['Calculate credit scores', 'Recommend loan limits', 'Flag high-risk applications']],
                ['name' => 'Fraud Detection Agent', 'description' => 'Identifies suspicious transactions and potential fraud in real-time', 'skills' => ['Anomaly detection', 'Pattern analysis', 'Behavioral analysis'], 'tools' => ['Transaction history', 'Device fingerprinting', 'Real-time alerts'], 'responsibilities' => ['Monitor transactions', 'Flag suspicious activity', 'Block fraudulent transactions']],
            ],
            'predefined_prompts' => [
                'Backend: Implement secure mobile money integration with multiple providers',
                'Frontend: Design a USSD menu system for feature phones',
            ],
        ]);

        Template::create([
            'name' => 'EdTech Learning Platform',
            'description' => 'An adaptive learning platform delivering localized educational content for African students.',
            'category' => 'EdTech',
            'icon' => 'graduation-cap',
            'is_featured' => true,
            'order' => 3,
            'questionnaire_data' => [
                'idea' => 'An adaptive learning platform delivering localized educational content in multiple African languages, accessible on low-bandwidth connections.',
                'countries' => ['Rwanda', 'Kenya', 'Ghana', 'Nigeria'],
                'userTypes' => ['Students', 'Teachers', 'Parents', 'Community Leaders'],
                'offlineAccess' => true,
                'features' => ['User profiles', 'Learning modules', 'Multi-language support', 'Data analytics', 'Content uploads'],
                'aiFeatures' => ['Personalized Content', 'Language Translation', 'Speech-to-Text'],
            ],
            'predefined_roles' => [
                ['name' => 'Student', 'description' => 'Learner accessing educational content', 'permissions' => ['View lessons', 'Take quizzes', 'Track progress', 'Download content'], 'actions' => ['Start lesson', 'Submit answer', 'Bookmark content', 'Request help']],
                ['name' => 'Teacher', 'description' => 'Educator creating and managing learning content', 'permissions' => ['Create lessons', 'Upload content', 'View student progress', 'Send messages'], 'actions' => ['Create quiz', 'Grade assignment', 'Provide feedback', 'Schedule class']],
                ['name' => 'Parent', 'description' => 'Guardian monitoring their childs educational progress', 'permissions' => ['View child progress', 'Receive notifications', 'Message teachers'], 'actions' => ['Check grades', 'View attendance', 'Pay fees', 'Schedule meeting']],
            ],
            'predefined_agents' => [
                ['name' => 'Adaptive Learning Agent', 'description' => 'Personalizes learning paths based on student performance', 'skills' => ['Learning style detection', 'Progress tracking', 'Content recommendation'], 'tools' => ['Performance analytics', 'Content database', 'Progress tracking'], 'responsibilities' => ['Adjust learning path', 'Identify knowledge gaps', 'Recommend additional practice']],
                ['name' => 'Language Tutor Agent', 'description' => 'Assists with language learning through conversation and translation', 'skills' => ['Language translation', 'Pronunciation checking', 'Grammar correction'], 'tools' => ['Speech recognition', 'Translation API', 'Language models'], 'responsibilities' => ['Translate text', 'Check pronunciation', 'Practice conversation']],
            ],
            'predefined_prompts' => [
                'Backend: Create a content management system supporting multiple African languages',
                'Frontend: Design an adaptive quiz interface with real-time feedback',
            ],
        ]);

        Template::create([
            'name' => 'HealthTech Telemedicine',
            'description' => 'A telemedicine platform connecting rural African communities with healthcare professionals.',
            'category' => 'HealthTech',
            'icon' => 'heartbeat',
            'is_featured' => true,
            'order' => 4,
            'questionnaire_data' => [
                'idea' => 'A telemedicine platform connecting rural African communities with healthcare professionals through mobile and USSD interfaces.',
                'countries' => ['Uganda', 'Rwanda', 'Tanzania', 'Kenya'],
                'userTypes' => ['Healthcare Workers', 'Small Business Owners', 'Community Leaders', 'Youth'],
                'offlineAccess' => true,
                'features' => ['User profiles', 'Appointments', 'Messaging', 'Notifications', 'Multi-language support'],
                'aiFeatures' => ['Diagnostic assistance', 'Symptom checker', 'Natural Language Processing'],
            ],
            'predefined_roles' => [
                ['name' => 'Patient', 'description' => 'Individual seeking medical advice and treatment', 'permissions' => ['Book appointment', 'Message doctor', 'View medical records', 'Receive reminders'], 'actions' => ['Schedule consultation', 'Describe symptoms', 'Upload test results', 'Pay for service']],
                ['name' => 'Doctor', 'description' => 'Healthcare professional providing medical consultations', 'permissions' => ['View patient history', 'Prescribe treatment', 'Write notes', 'Refer to specialist'], 'actions' => ['Start consultation', 'Diagnose condition', 'Prescribe medication', 'Order tests']],
                ['name' => 'Community Health Worker', 'description' => 'Local healthcare worker assisting patients and facilitating care', 'permissions' => ['Register patients', 'Schedule appointments', 'Follow up', 'Collect vitals'], 'actions' => ['Register new patient', 'Schedule home visit', 'Report symptoms', 'Distribute medication']],
            ],
            'predefined_agents' => [
                ['name' => 'Symptom Checker Agent', 'description' => 'Analyzes patient symptoms and suggests possible conditions', 'skills' => ['Symptom analysis', 'Condition matching', 'Risk assessment'], 'tools' => ['Medical knowledge base', 'Symptom database', 'Patient history'], 'responsibilities' => ['Analyze reported symptoms', 'Suggest possible diagnoses', 'Recommend urgency level']],
                ['name' => 'Appointment Scheduler Agent', 'description' => 'Intelligently schedules appointments based on doctor availability', 'skills' => ['Calendar management', 'Priority assessment', 'Conflict resolution'], 'tools' => ['Calendar system', 'Doctor schedules', 'Patient records'], 'responsibilities' => ['Schedule new appointments', 'Send reminders', 'Manage rescheduling']],
            ],
            'predefined_prompts' => [
                'Backend: Create a HIPAA-compliant patient record management system',
                'Frontend: Design a mobile-first patient dashboard with appointment management',
            ],
        ]);

        Template::create([
            'name' => 'Logistics & Delivery Platform',
            'description' => 'A last-mile delivery platform for African e-commerce and businesses.',
            'category' => 'Logistics',
            'icon' => 'truck',
            'is_featured' => true,
            'order' => 5,
            'questionnaire_data' => [
                'idea' => 'A last-mile delivery platform connecting drivers with businesses and customers for efficient package delivery across African cities.',
                'countries' => ['Nigeria', 'Kenya', 'Ghana', 'South Africa'],
                'userTypes' => ['Small Business Owners', 'Drivers', 'Traders', 'Customers'],
                'offlineAccess' => true,
                'features' => ['User profiles', 'Payments', 'Messaging', 'Maps', 'Notifications', 'Task management'],
                'aiFeatures' => ['Route optimization', 'Predictions', 'Recommendations'],
            ],
            'predefined_roles' => [
                ['name' => 'Driver', 'description' => 'Delivery personnel transporting packages', 'permissions' => ['View delivery requests', 'Accept deliveries', 'Update status', 'Contact customer'], 'actions' => ['Accept delivery', 'Mark as picked up', 'Mark as delivered', 'Report issue']],
                ['name' => 'Business', 'description' => 'Merchant sending packages for delivery', 'permissions' => ['Create delivery request', 'Track packages', 'Manage payments', 'Rate drivers'], 'actions' => ['Request pickup', 'Track delivery', 'Pay driver', 'Leave review']],
                ['name' => 'Customer', 'description' => 'Recipient of delivered packages', 'permissions' => ['Track deliveries', 'Contact driver', 'Confirm receipt', 'Leave feedback'], 'actions' => ['Track package', 'Message driver', 'Confirm delivery', 'Rate experience']],
            ],
            'predefined_agents' => [
                ['name' => 'Route Optimization Agent', 'description' => 'Calculates the most efficient delivery routes', 'skills' => ['Route calculation', 'Traffic analysis', 'Time estimation'], 'tools' => ['Maps API', 'Traffic data', 'Delivery database'], 'responsibilities' => ['Calculate optimal routes', 'Estimate delivery times', 'Re-optimize based on changes']],
                ['name' => 'Delivery Tracking Agent', 'description' => 'Provides real-time tracking and notifications', 'skills' => ['Location tracking', 'Status updates', 'Notification management'], 'tools' => ['GPS data', 'Delivery database', 'Notification system'], 'responsibilities' => ['Track package location', 'Send status updates', 'Notify recipients']],
            ],
            'predefined_prompts' => [
                'Backend: Create a delivery tracking system with real-time GPS updates',
                'Frontend: Design a driver mobile app with delivery management',
            ],
        ]);
    }
}
