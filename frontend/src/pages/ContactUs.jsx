import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const ContactUs = () => {
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
                    Contact Us
                  </h1>
                  <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                  </p>
                </div>
              </div>

              {/* Contact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* Email Card */}
                <div className="bg-white dark:bg-gray-900/50 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Email Support
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Get in touch via email
                    </p>
                    <a 
                      href="mailto:kimi@studyx.ai" 
                      className="text-primary hover:text-accent-purple transition-colors font-semibold text-base"
                    >
                      kimi@studyx.ai
                    </a>
                  </div>
                </div>

                {/* FAQ Card */}
                <div className="bg-white dark:bg-gray-900/50 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-accent-purple/10 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      FAQ
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Find quick answers
                    </p>
                    <button 
                      onClick={() => navigate('/')}
                      className="text-accent-purple hover:text-primary transition-colors font-semibold text-base"
                    >
                      View FAQ
                    </button>
                  </div>
                </div>

                {/* Feedback Card */}
                <div className="bg-white dark:bg-gray-900/50 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Feedback
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Share your thoughts
                    </p>
                    <a 
                      href="mailto:kimi@studyx.ai?subject=AIPodcast Feedback" 
                      className="text-green-500 hover:text-green-600 transition-colors font-semibold text-base"
                    >
                      Send Feedback
                    </a>
                  </div>
                </div>

              </div>

              {/* Main Content */}
              <div className="bg-white dark:bg-gray-900/50 rounded-3xl shadow-sm p-6 sm:p-8 lg:p-12 mb-8">
                
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Get in Touch
                </h2>
                
                <div className="space-y-6">
                  
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Support Hours
                    </h3>
                    <p className="text-base text-gray-700 dark:text-gray-300">
                      Our support team is available Monday through Friday, 9:00 AM - 6:00 PM (PST). We aim to respond to all inquiries within 24 hours.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      What to Include in Your Message
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                      <li>A clear description of your question or issue</li>
                      <li>Your account email (if applicable)</li>
                      <li>Screenshots or error messages (if relevant)</li>
                      <li>Steps to reproduce the issue (for technical problems)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Common Topics
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-gray-700 dark:text-gray-300">Account & Billing</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-gray-700 dark:text-gray-300">Technical Support</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-gray-700 dark:text-gray-300">Feature Requests</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-gray-700 dark:text-gray-300">General Inquiries</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-gray-700 dark:text-gray-300">Privacy & Security</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-gray-700 dark:text-gray-300">Partnership Opportunities</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Before Contacting Support
                    </h3>
                    <p className="text-base text-gray-700 dark:text-gray-300 mb-3">
                      Check out our FAQ section on the homepage for quick answers to common questions about:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
                      <li>Supported file formats</li>
                      <li>Audio generation process</li>
                      <li>Data privacy and security</li>
                      <li>Free trial information</li>
                    </ul>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Business Inquiries
                    </h3>
                    <p className="text-base text-gray-700 dark:text-gray-300 mb-3">
                      For partnership opportunities, media inquiries, or other business-related questions, please email us at:
                    </p>
                    <a 
                      href="mailto:kimi@studyx.ai?subject=Business Inquiry" 
                      className="text-primary hover:text-accent-purple transition-colors font-semibold text-lg inline-block"
                    >
                      kimi@studyx.ai
                    </a>
                  </div>

                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-primary to-accent-purple rounded-3xl shadow-lg p-8 mb-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Ready to Transform Your Content?
                </h2>
                <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                  Start creating professional podcasts today with AIPodcast's AI Podcast Generator.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-3 bg-white text-primary rounded-xl font-semibold text-base hover:bg-gray-100 transition-colors shadow-md"
                >
                  Get Started Free
                </button>
              </div>

              {/* Footer */}
              <footer className="py-8 text-center border-t border-gray-200 dark:border-gray-800">
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

export default ContactUs;

