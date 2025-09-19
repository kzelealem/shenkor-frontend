import { useEffect, useMemo, useState } from "react";
import DashboardPage from "@/features/dashboard/DashboardPage";
import AttendancePage from "@/features/attendance/AttendancePage";
import MembersPage from "@/features/members/MembersPage";
import LoginPage from "@/features/auth/LoginPage";
import SignupPage from "@/features/auth/SignupPage";
import ForgotPasswordPage from "@/features/auth/ForgotPasswordPage";
import { ThemeToggle } from "@/theme/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export type Page = "login" | "signup" | "forgot" | "dashboard" | "attendance" | "members";

const AUTH_PAGES: Page[] = ["login", "signup", "forgot"];
const APP_PAGES: Page[] = ["dashboard", "attendance", "members"];

export default function App() {
  const { isAuthed, logout } = useAuth();
  const { t } = useTranslation('common');
  const [currentPage, setCurrentPage] = useState<Page>(isAuthed ? "dashboard" : "login");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPage(isAuthed ? "dashboard" : "login");
  }, [isAuthed]);

  const pageToRender = useMemo<Page>(() => {
    if (!isAuthed) {
      return AUTH_PAGES.includes(currentPage) ? currentPage : "login";
    }
    return APP_PAGES.includes(currentPage) ? currentPage : "dashboard";
  }, [currentPage, isAuthed]);

  const navigate = (page: Page, context?: { submissionId?: string }) => {
    window.scrollTo(0, 0);
    if (page === 'attendance' && context?.submissionId) {
      setEditingId(context.submissionId);
    } else {
      setEditingId(null);
    }
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-gray-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
        {isAuthed && (
          <button
            onClick={logout}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60"
            aria-label={t('signOut')}
          >
            {t('signOut')}
          </button>
        )}
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {!isAuthed ? (
        <>
          {pageToRender === "login" && <LoginPage onNavigate={navigate} />}
          {pageToRender === "signup" && <SignupPage onNavigate={navigate} />}
          {pageToRender === "forgot" && <ForgotPasswordPage onNavigate={navigate} />}
        </>
      ) : (
        <>
          {pageToRender === "dashboard" && <DashboardPage onNavigate={navigate} />}
          {pageToRender === "attendance" && <AttendancePage onNavigate={navigate} submissionId={editingId} />}
          {pageToRender === "members" && <MembersPage onNavigate={navigate} />}
        </>
      )}
    </div>
  );
}
