import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const TermsOfService = () => {
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
                    Terms of Service
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
                    Welcome to EchoCast! Please carefully read and review these <strong>Terms of Service</strong> (these "<strong>Terms</strong>") before you ("<strong>User</strong>", "<strong>Users</strong>") can use EchoCast. These Terms govern your use of and access to all EchoCast website(s), products, services and applications ("<strong>EchoCast</strong>"). By agreeing to these Terms, you expressly acknowledge that you fully understand and accept all clauses and provisions of these Terms.
                  </p>

                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    EchoCast is offered and operated by <strong>StudyX</strong> ("<strong>StudyX</strong>", "<strong>we</strong>", "<strong>our</strong>" and "<strong>us</strong>"). Unless otherwise stated, your use of EchoCast is bound by these Terms between you and us. <strong>By using EchoCast, you agree to these Terms. If you do not agree to these Terms, you may not use or access EchoCast.</strong>
                  </p>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    Changes to these Terms
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    We may make changes to these Terms from time to time to reflect our service improvements. We will notify you via a notice either on our website or EchoCast platform prior to any changes becoming effective. Your continued use of EchoCast after the effective date of any changes to these Terms constitutes your agreeing to the revised Terms.
                  </p>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    Your Use of the Services
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    Upon your agreeing to these Terms, we hereby grant you a personal, non-transferable, non-exclusive, revocable, limited license to access and use the Services, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                    <li><strong>Upload Content:</strong> Users may upload text files, audio files, or video files to generate podcasts.</li>
                    <li><strong>AI Generation:</strong> Users may use our AI-powered tools to generate podcast scripts and audio from their content.</li>
                    <li><strong>Podcast Management:</strong> Users can manage, edit, and download their generated podcasts.</li>
                    <li><strong>Other Services:</strong> Other online services provided by EchoCast.</li>
                  </ul>

                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mt-4">
                    We reserve the right to make changes to EchoCast anytime, including but not limited to, adding, deleting or modifying any part of EchoCast website(s), products, services, documents and applications. Notice shall be published on EchoCast website or platform prior to any changes becoming effective.
                  </p>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    Your Account
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    To use certain features of our Services, you may be required to create an EchoCast account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                  </p>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    Your Content
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    When you submit, upload, transmit or display any information, content or materials in connection with your use of EchoCast ("<strong>Your Content</strong>"), you understand and agree that you will continue to own and be responsible for Your Content. By using EchoCast, you are granting us a limited, non-exclusive, royalty-free license to use Your Content solely for the purposes of providing and improving EchoCast services.
                  </p>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    Our Intellectual Property Rights
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    All intellectual property rights in or to EchoCast (including any future updates, upgrades and new versions to EchoCast) belong to us and our licensors. Without our prior written consent, you have no right to use our intellectual property rights, including but not limited to, our product names, logos, designs, domain names or other distinctive brand features.
                  </p>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    Prohibited Uses
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    You agree not to use EchoCast for any unlawful purpose or in any way that could damage, disable, overburden, or impair our services. You shall not upload content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.
                  </p>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    Limitation of Liability
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    To the maximum extent permitted by applicable law, EchoCast and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                  </p>

                  <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
                    Contact Us
                  </h3>
                  <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
                    If you have any questions about these Terms, please contact us at{' '}
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

export default TermsOfService;

