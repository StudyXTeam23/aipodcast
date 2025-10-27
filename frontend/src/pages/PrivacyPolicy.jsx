import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDEFE3] dark:bg-background-dark font-display text-text-light dark:text-text-dark">
      <Header />
      <div className="relative flex h-auto w-full flex-col overflow-x-hidden">
        <div className="layout-container flex h-full grow flex-col">
          <div className="flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-4xl flex-1 px-4 sm:px-6 lg:px-8">
              
              {/* Hero Section */}
              <div className="relative py-16 text-center bg-white dark:bg-gray-900/50 rounded-3xl overflow-hidden shadow-sm mb-8">
                <div className="relative z-10 px-4 sm:px-6 lg:px-8">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-purple">
                    Privacy Policy
                  </h1>
                  <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                    Last updated: October 23, 2025
                  </p>
                </div>
              </div>

              {/* Content Section */}
              <div className="bg-white dark:bg-gray-900/50 rounded-3xl shadow-sm p-6 sm:p-8 lg:p-12 mb-8">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    Thank you for using AIPodcast ("<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>"). We understand the importance of personal information to you and appreciate your trust in us. To the extent permitted by applicable laws and regulations, we will take appropriate security measures to protect your personal information and keep your personal information safe and secure.
                  </p>

                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    This AIPodcast Privacy Policy ("<strong>Privacy Policy</strong>") explains how we collect, store, use and secure your personal information and your rights. This Privacy Policy applies to all AIPodcast products and services, including our AI Podcast Generator. <strong>By using AIPodcast, you fully understand, acknowledge and agree to this Privacy Policy.</strong>
                  </p>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    1. Information We Collect
                  </h3>
                  
                  <h4 className="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">
                    Account Information
                  </h4>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    To use AIPodcast's AI Podcast Generator, you may provide your email address and create an account password. Optionally, you may provide additional profile information.
                  </p>

                  <h4 className="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">
                    Your Content
                  </h4>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    When you upload files (text, audio, video, YouTube URLs) or generate podcasts using our AI Podcast Generator, these files are temporarily stored on our servers to provide the service. We do not access or use your content for any purpose other than providing AIPodcast services, unless required by law.
                  </p>

                  <h4 className="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">
                    Usage Information
                  </h4>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    We automatically collect certain information about your device and how you use AIPodcast, including your IP address, device type, browser type, operating system, and usage patterns.
                  </p>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    2. How We Use Your Information
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    We use your information for the following purposes:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>To provide, operate, and maintain AIPodcast's AI Podcast Generator services</li>
                    <li>To process your uploaded content and generate podcasts</li>
                    <li>To improve and optimize our services and user experience</li>
                    <li>To communicate with you about service updates and support</li>
                    <li>To ensure the security and integrity of our platform</li>
                    <li>To comply with legal obligations</li>
                  </ul>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    3. How We Store Your Information
                  </h3>
                  
                  <h4 className="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">
                    Data Storage Location
                  </h4>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    Your information is stored on secure cloud servers. We use industry-standard security measures to protect your data from unauthorized access, disclosure, or destruction.
                  </p>

                  <h4 className="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">
                    Storage Period
                  </h4>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    We will store your information only for as long as necessary to provide our services or as required by law. You can delete your uploaded content and account at any time through your account settings.
                  </p>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    4. How We Secure Your Information
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    We implement appropriate technical and organizational security measures to protect your personal information, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication mechanisms</li>
                    <li>Employee training on data protection and privacy</li>
                    <li>Incident response procedures for security breaches</li>
                  </ul>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    5. Sharing and Disclosure
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li>With your explicit consent</li>
                    <li>With service providers who assist us in operating our platform (under strict confidentiality agreements)</li>
                    <li>When required by law or to protect our legal rights</li>
                    <li>In connection with a business transfer or merger</li>
                  </ul>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    6. Your Rights
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    You have the following rights regarding your personal information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li><strong>Access:</strong> Request access to your personal information</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                    <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                    <li><strong>Objection:</strong> Object to certain processing of your information</li>
                  </ul>

                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mt-4">
                    To exercise these rights, please contact us at{' '}
                    <a 
                      href="mailto:kimi@studyx.ai" 
                      className="text-primary hover:text-accent-purple transition-colors font-semibold"
                    >
                      kimi@studyx.ai
                    </a>
                  </p>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    7. Cookies and Tracking Technologies
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    We use cookies and similar tracking technologies to improve your experience on AIPodcast. You can control cookies through your browser settings. However, disabling cookies may affect some features of our AI Podcast Generator service.
                  </p>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    8. Third-Party Services
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    AIPodcast uses third-party services (such as ElevenLabs for text-to-speech and Google Gemini for AI generation) to power our AI Podcast Generator. These services have their own privacy policies, and we encourage you to review them. We only share the minimum necessary information with these services to provide our features.
                  </p>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    9. Children's Privacy
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    AIPodcast is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                  </p>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    10. Changes to this Privacy Policy
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of AIPodcast after any changes constitutes your acceptance of the updated Privacy Policy.
                  </p>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    11. Contact Us
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at{' '}
                    <a 
                      href="mailto:kimi@studyx.ai" 
                      className="text-primary hover:text-accent-purple transition-colors font-semibold"
                    >
                      kimi@studyx.ai
                    </a>
                  </p>

                </div>
              </div>

              {/* Footer */}
              <footer className="py-8 text-center border-t border-gray-200 dark:border-gray-800 mt-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  © 2025 StudyX. All rights reserved.
                </p>
              </footer>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

