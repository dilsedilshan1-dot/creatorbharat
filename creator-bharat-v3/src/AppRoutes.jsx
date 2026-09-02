import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CreatorLayout from '@/components/layout/CreatorLayout';
import { useApp } from '@/core/context';
import PremiumLock from '@/components/auth/PremiumLock';
import ProMembershipLock from '@/components/auth/ProMembershipLock';
import PageLoader from '@/components/common/PageLoader';

// Public Pages
const HomePage = lazy(() => import('./pages/public/HomePage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const PricingPage = lazy(() => import('./pages/public/PricingPage'));
const FAQPage = lazy(() => import('./pages/public/FAQPage'));
const RateCalcPage = lazy(() => import('./pages/public/RateCalcPage'));
const LeaderboardPage = lazy(() => import('./pages/public/LeaderboardPage'));
const OfficialProfilePage = lazy(() => import('./pages/public/OfficialProfilePage'));
const CreatorDensityPage = lazy(() => import('./pages/public/CreatorDensityPage'));
const ServerErrorPage = lazy(() => import('./pages/public/ServerErrorPage'));
const NotificationsHub = lazy(() => import('./pages/public/NotificationsHub'));
const SuccessStoriesPage = lazy(() => import('./pages/public/SuccessStoriesPage'));
const BrandLandingPage = lazy(() => import('./pages/public/BrandLandingPage'));
const CreatorLandingPage = lazy(() => import('./pages/public/CreatorLandingPage'));
const EventsPublicPage = lazy(() => import('./pages/creator/EventsPage'));
const AiFaqPage = lazy(() => import('./pages/public/AiFaqPage'));
const VerificationGuidePage = lazy(() => import('./pages/public/VerificationGuidePage'));
const AmbassadorPage = lazy(() => import('./pages/public/AmbassadorPage'));
const PressPage = lazy(() => import('./pages/public/PressPage'));
const GalleryPage = lazy(() => import('./pages/public/GalleryPage'));

// Role-based Notifications Pages
const CreatorNotificationsPage = lazy(() => import('./pages/creator/NotificationsPage'));
const BrandNotificationsPage = lazy(() => import('./pages/brand/NotificationsPage'));

// Brand/Marketplace Pages
const CreatorsPage = lazy(() => import('./pages/brand/CreatorsPage'));
const CampaignsPage = lazy(() => import('./pages/brand/CampaignsPage'));
const CampaignBuilderPage = lazy(() => import('./pages/brand/CampaignBuilderPage'));
const BrandDashboardPage = lazy(() => import('./pages/brand/BrandDashboardPage'));
const BrandApplicationsPage = lazy(() => import('./pages/brand/BrandApplicationsPage'));
const BrandAnalyticsPage = lazy(() => import('./pages/brand/BrandAnalyticsPage'));
const ComparePage = lazy(() => import('./pages/brand/ComparePage'));

// Creator Pages
const DashboardPage = lazy(() => import('./pages/creator/DashboardPage'));
const SettingsPage = lazy(() => import('./pages/creator/SettingsPage'));
const ProfileBuilderPage = lazy(() => import('./pages/creator/ProfileBuilderPage'));
const WalletPage = lazy(() => import('./pages/creator/WalletPage'));
const ApplicationsPage = lazy(() => import('./pages/creator/ApplicationsPage'));
const CreatorScorePage = lazy(() => import('./pages/creator/CreatorScorePage'));
const CreatorProfilePage = lazy(() => import('./pages/creator/CreatorProfilePage'));
const SavedPage = lazy(() => import('./pages/creator/SavedPage'));
const MonetizationPage = lazy(() => import('./pages/creator/MonetizationPage'));
const MessagesPage = lazy(() => import('./pages/creator/MessagesPage'));
const CreatorOnboardingPage = lazy(() => import('./pages/creator/OnboardingPage'));
const CreatorOpportunitiesPage = lazy(() => import('./pages/creator/OpportunitiesPage'));
const CreatorCommunityPage = lazy(() => import('./pages/creator/CommunityPage'));
const CreatorPublicPreviewPage = lazy(() => import('./pages/creator/PublicPreviewPage'));
const CreatorVerificationPage = lazy(() => import('./pages/creator/VerificationPage'));
const CreatorAnalyticsPage = lazy(() => import('./pages/creator/AnalyticsPage'));
const CreatorCalendarPage = lazy(() => import('./pages/creator/CalendarPage'));
const CreatorBrandRequestsPage = lazy(() => import('./pages/creator/BrandRequestsPage'));
const CreatorHelpPage = lazy(() => import('./pages/creator/HelpPage'));
const CreatorEventsPage = lazy(() => import('./pages/creator/EventsPage'));
const AchievementsPage = lazy(() => import('./pages/creator/AchievementsPage'));

// Legal
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/legal/TermsPage'));
const CreatorGuidelinesPage = lazy(() => import('./pages/legal/CreatorGuidelinesPage'));
const BrandGuidelinesPage = lazy(() => import('./pages/legal/BrandGuidelinesPage'));
const CookiePolicyPage = lazy(() => import('./pages/legal/CookiePolicyPage'));
const RefundPolicyPage = lazy(() => import('./pages/legal/RefundPolicyPage'));

// Auth
import ProtectedRoute from '@/core/ProtectedRoute';
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const ApplyPage = lazy(() => import('./pages/auth/ApplyPage'));
const BrandRegisterPage = lazy(() => import('./pages/auth/BrandRegisterPage'));
const JoinPage = lazy(() => import('./pages/auth/JoinPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const VerificationPage = lazy(() => import('./pages/auth/VerificationPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'));

// Blog
const BlogPage = lazy(() => import('./pages/blog/BlogPage'));
const BlogArticlePage = lazy(() => import('./pages/blog/BlogArticlePage'));

const Fallback = () => <PageLoader message="Entering Elite Ecosystem..." fullScreen darkTheme={false} />;

const AuthLock = ({ children }) => {
  const { st } = useApp();
  if (!st.user) return <PremiumLock>{children}</PremiumLock>;
  return children;
};

AuthLock.propTypes = {
  children: PropTypes.node.isRequired
};

export default function AppRoutes({ location }) {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes location={location}>
        
        {/* Auth & No-Layout Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/brand-register" element={<BrandRegisterPage />} />
        <Route path="/brand/register" element={<BrandRegisterPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify" element={<VerificationPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/500" element={<ServerErrorPage />} />

        {/* Public Layout Group */}
        <Route element={<PublicLayout><Outlet /></PublicLayout>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/faqs" element={<Navigate to="/faq" replace />} />
          <Route path="/help" element={<Navigate to="/faq" replace />} />
          <Route path="/verify-guide" element={<VerificationGuidePage />} />
          <Route path="/ai-knowledge" element={<AiFaqPage />} />
          <Route path="/ai-faq" element={<AiFaqPage />} />
          <Route path="/rate-calc" element={<RateCalcPage />} />
          <Route path="/calculator" element={<Navigate to="/rate-calc" replace />} />
          <Route path="/rate-calculator" element={<Navigate to="/rate-calc" replace />} />
          <Route path="/ambassador" element={<AmbassadorPage />} />
          <Route path="/press" element={<PressPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/official-profile" element={<OfficialProfilePage />} />
          <Route path="/creator-density" element={<CreatorDensityPage />} />
          <Route path="/notifications" element={<NotificationsHub />} />
          <Route path="/stories" element={<SuccessStoriesPage />} />
          <Route path="/brand" element={<BrandLandingPage />} />
          <Route path="/creator-hub" element={<CreatorLandingPage />} />
          <Route path="/events" element={<EventsPublicPage />} />
          <Route path="/creators" element={<CreatorsPage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/compare" element={<ProtectedRoute allowedRole="brand"><ComparePage /></ProtectedRoute>} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogArticlePage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />
          <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />
          <Route path="/creator-guidelines" element={<CreatorGuidelinesPage />} />
          <Route path="/brand-guidelines" element={<BrandGuidelinesPage />} />
          <Route path="/brand-rules" element={<Navigate to="/brand-guidelines" replace />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route path="/cookie-policy" element={<Navigate to="/cookies" replace />} />
          <Route path="/refunds" element={<RefundPolicyPage />} />
          <Route path="/refund-policy" element={<Navigate to="/refunds" replace />} />
          <Route path="/creator/:id" element={<CreatorProfilePage />} />
          <Route path="/c/:id" element={<CreatorProfilePage />} />
        </Route>

        {/* Creator Ecosystem Group - Completely Isolated Layout */}
        <Route element={<ProtectedRoute allowedRole="creator"><CreatorLayout><Outlet /></CreatorLayout></ProtectedRoute>}>
          <Route path="/creator/dashboard" element={<DashboardPage />} />
          <Route path="/creator/onboarding" element={<CreatorOnboardingPage />} />
          <Route path="/creator/profile" element={<ProfileBuilderPage />} />
          <Route path="/creator/public-preview" element={<CreatorPublicPreviewPage />} />
          <Route path="/creator/opportunities" element={<CreatorOpportunitiesPage />} />
          <Route path="/creator/applications" element={<ApplicationsPage />} />
          <Route path="/creator/brand-requests" element={<CreatorBrandRequestsPage />} />
          <Route path="/creator/community" element={<CreatorCommunityPage />} />
          <Route path="/creator/community/:id" element={<CreatorCommunityPage />} />
          <Route path="/creator/wallet" element={<WalletPage />} />
          <Route path="/creator/analytics" element={<CreatorAnalyticsPage />} />
          <Route path="/creator/monetization" element={<MonetizationPage />} />
          <Route path="/creator/score" element={<CreatorScorePage />} />
          <Route path="/creator/verification" element={<CreatorVerificationPage />} />
          <Route path="/creator/notifications" element={<CreatorNotificationsPage />} />
          <Route path="/creator/calendar" element={<ProMembershipLock><CreatorCalendarPage /></ProMembershipLock>} />
          <Route path="/creator/messages" element={<MessagesPage />} />
          <Route path="/creator/saved" element={<SavedPage />} />
          <Route path="/creator/settings" element={<SettingsPage />} />
          <Route path="/creator/help" element={<CreatorHelpPage />} />
          <Route path="/creator/events" element={<CreatorEventsPage />} />
          <Route path="/creator/achievements" element={<AchievementsPage />} />
          {/* Public Features Embedded in Creator Flow */}
          <Route path="/creator/blog" element={<BlogPage />} />
          <Route path="/creator/blog/:slug" element={<BlogArticlePage />} />
          <Route path="/creator/official-profile" element={<OfficialProfilePage />} />
          <Route path="/creator/creator-density" element={<CreatorDensityPage />} />
          <Route path="/creator/verify-guide" element={<VerificationGuidePage />} />
          <Route path="/creator/stories" element={<SuccessStoriesPage />} />
          <Route path="/creator/gallery" element={<GalleryPage />} />
          <Route path="/creator/rate-calc" element={<RateCalcPage />} />
          <Route path="/creator/leaderboard" element={<LeaderboardPage />} />
          <Route path="/creator/guidelines" element={<CreatorGuidelinesPage />} />
          <Route path="/creator/pricing" element={<PricingPage />} />
          <Route path="/creator/about" element={<AboutPage />} />
          <Route path="/creator/contact" element={<ContactPage />} />
          <Route path="/creator/faq" element={<FAQPage />} />
          <Route path="/creator/privacy" element={<PrivacyPage />} />
          <Route path="/creator/terms" element={<TermsPage />} />
          <Route path="/creator/cookies" element={<CookiePolicyPage />} />
          <Route path="/creator/refunds" element={<RefundPolicyPage />} />
          <Route path="/creator/c/:id" element={<CreatorProfilePage />} />

          {/* Legacy creator routes mapping to the new layout */}
          <Route path="/dashboard" element={<Navigate to="/creator/dashboard" replace />} />
          <Route path="/wallet" element={<Navigate to="/creator/wallet" replace />} />
          <Route path="/applications" element={<Navigate to="/creator/applications" replace />} />
          <Route path="/creator-score" element={<Navigate to="/creator/score" replace />} />
          <Route path="/saved" element={<Navigate to="/creator/saved" replace />} />
          <Route path="/monetize" element={<Navigate to="/creator/monetization" replace />} />
          <Route path="/monetization" element={<Navigate to="/creator/monetization" replace />} />
          <Route path="/messages" element={<Navigate to="/creator/messages" replace />} />
        </Route>

        {/* Brand Ecosystem Group - Completely Isolated Layout */}
        <Route element={<ProtectedRoute allowedRole="brand"><DashboardLayout><Outlet /></DashboardLayout></ProtectedRoute>}>
          <Route path="/brand-dashboard" element={<BrandDashboardPage />} />
          <Route path="/brand/dashboard" element={<BrandDashboardPage />} />
          <Route path="/brand-applications" element={<BrandApplicationsPage />} />
          <Route path="/brand/applications" element={<BrandApplicationsPage />} />
          <Route path="/brand-analytics" element={<BrandAnalyticsPage />} />
          <Route path="/brand/analytics" element={<BrandAnalyticsPage />} />
          <Route path="/campaign-builder" element={<CampaignBuilderPage />} />
          <Route path="/brand/campaign-builder" element={<CampaignBuilderPage />} />
          <Route path="/brand/notifications" element={<BrandNotificationsPage />} />
          <Route path="/brand/creator-density" element={<CreatorDensityPage />} />
          <Route path="/brand/creators" element={<CreatorsPage />} />
          <Route path="/brand/campaigns" element={<CampaignsPage />} />
          <Route path="/brand/compare" element={<ComparePage />} />
          <Route path="/brand/settings" element={<SettingsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

AppRoutes.propTypes = {
  location: PropTypes.object
};

