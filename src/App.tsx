import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AlertBanner } from './components/AlertBanner';
import { Dashboard } from './components/Dashboard';
import { HouseProfileModal } from './components/HouseProfileModal';
import { ApplianceList } from './components/ApplianceList';
import { ApplianceFormModal } from './components/ApplianceFormModal';
import { ScanLabelModal } from './components/ScanLabelModal';
import { VoiceInputModal } from './components/VoiceInputModal';
import { TokenSimulator } from './components/TokenSimulator';
import { ChartsSection } from './components/ChartsSection';
import { AiAdvisor } from './components/AiAdvisor';
import { SettingsModal } from './components/SettingsModal';
import { AutoAnalysisModal } from './components/AutoAnalysisModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { Footer } from './components/Footer';

import { HouseProfile, Appliance, TokenData, ThemeSettings } from './types';
import {
  loadHouseProfile,
  saveHouseProfile,
  loadAppliances,
  saveAppliances,
  loadTokenData,
  saveTokenData,
  loadThemeSettings,
  saveThemeSettings,
  loadUserName,
  saveUserName,
  loadIsOnboarded,
  saveIsOnboarded,
} from './utils/storage';
import { calculateElectricity, simulateToken, getEffectiveTariff } from './utils/calculator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appliances' | 'simulator' | 'charts' | 'ai'>('dashboard');

  const [userName, setUserName] = useState<string>(loadUserName);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(loadIsOnboarded);

  const [profile, setProfile] = useState<HouseProfile>(loadHouseProfile);
  const [appliances, setAppliances] = useState<Appliance[]>(loadAppliances);
  const [tokenData, setTokenData] = useState<TokenData>(loadTokenData);
  const [theme, setTheme] = useState<ThemeSettings>(loadThemeSettings);

  // Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isApplianceFormOpen, setIsApplianceFormOpen] = useState<boolean>(false);
  const [applianceToEdit, setApplianceToEdit] = useState<Appliance | null>(null);
  const [isScanLabelOpen, setIsScanLabelOpen] = useState<boolean>(false);
  const [isVoiceInputOpen, setIsVoiceInputOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAutoAnalysisOpen, setIsAutoAnalysisOpen] = useState<boolean>(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | null>(null);

  const handleOpenAiAdvisorWithPrompt = (prompt?: string) => {
    if (prompt) {
      setAiInitialPrompt(prompt);
    }
    setActiveTab('ai');
  };

  const handleOnboardingComplete = (name: string) => {
    setUserName(name);
    saveUserName(name);
    setIsOnboarded(true);
    saveIsOnboarded(true);
  };

  const handleSaveUserName = (newName: string) => {
    setUserName(newName);
    saveUserName(newName);
  };

  // Apply dark mode to document HTML
  useEffect(() => {
    if (theme.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveThemeSettings(theme);
  }, [theme]);

  // Sync data reloads from LocalStorage
  const handleReloadAllData = () => {
    setUserName(loadUserName());
    setIsOnboarded(loadIsOnboarded());
    setProfile(loadHouseProfile());
    setAppliances(loadAppliances());
    setTokenData(loadTokenData());
    setTheme(loadThemeSettings());
  };

  // Profile save
  const handleSaveProfile = (updated: HouseProfile) => {
    setProfile(updated);
    saveHouseProfile(updated);
  };

  // Appliance CRUD actions
  const handleSaveAppliance = (appData: Omit<Appliance, 'id'> | Appliance) => {
    let updatedList: Appliance[];
    if ('id' in appData) {
      // Edit existing
      updatedList = appliances.map((a) => (a.id === appData.id ? appData : a));
    } else {
      // Add new
      const newAppliance: Appliance = {
        ...appData,
        id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      };
      updatedList = [...appliances, newAppliance];
    }
    setAppliances(updatedList);
    saveAppliances(updatedList);
  };

  const handleDeleteAppliance = (id: string) => {
    const updated = appliances.filter((a) => a.id !== id);
    setAppliances(updated);
    saveAppliances(updated);
  };

  const handleDuplicateAppliance = (appliance: Appliance) => {
    const duplicated: Appliance = {
      ...appliance,
      id: `app-dup-${Date.now()}`,
      name: `${appliance.name} (Salinan)`,
    };
    const updated = [...appliances, duplicated];
    setAppliances(updated);
    saveAppliances(updated);
  };

  // Token Data save
  const handleSaveTokenData = (updated: TokenData) => {
    setTokenData(updated);
    saveTokenData(updated);
  };

  // Perform core electricity calculations
  const calcResult = calculateElectricity(appliances, profile);
  const tokenSimResult = simulateToken(tokenData, profile, calcResult.kwhPerDay);
  const effectiveTariff = getEffectiveTariff(profile);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300 pb-20 md:pb-8">
      {/* Welcome Screen Onboarding for First Time Users */}
      {!isOnboarded && (
        <WelcomeScreen onComplete={handleOnboardingComplete} />
      )}

      <PwaInstallPrompt />

      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        theme={theme}
        setTheme={setTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        isOverCapacity={calcResult.isOverCapacity}
        isNearCapacity={calcResult.isNearCapacity}
      />

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Smart Alert Notifications Banner */}
        <AlertBanner
          userName={userName}
          calc={calcResult}
          tokenSim={tokenSimResult}
          onOpenAiAdvisor={() => setActiveTab('ai')}
        />

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <Dashboard
            userName={userName}
            profile={profile}
            calc={calcResult}
            tokenSim={tokenSimResult}
            onOpenScanLabel={() => setIsScanLabelOpen(true)}
            onOpenVoiceInput={() => setIsVoiceInputOpen(true)}
            onOpenAddAppliance={() => {
              setApplianceToEdit(null);
              setIsApplianceFormOpen(true);
            }}
            onOpenAiAdvisor={handleOpenAiAdvisorWithPrompt}
            onOpenAutoAnalysis={() => setIsAutoAnalysisOpen(true)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'appliances' && (
          <ApplianceList
            appliances={appliances}
            onAdd={handleSaveAppliance}
            onEdit={(app) => {
              setApplianceToEdit(app);
              setIsApplianceFormOpen(true);
            }}
            onDelete={handleDeleteAppliance}
            onDuplicate={handleDuplicateAppliance}
            onOpenScanLabel={() => setIsScanLabelOpen(true)}
            onOpenVoiceInput={() => setIsVoiceInputOpen(true)}
            onOpenAddModal={() => {
              setApplianceToEdit(null);
              setIsApplianceFormOpen(true);
            }}
            effectiveTariff={effectiveTariff}
          />
        )}

        {activeTab === 'simulator' && (
          <TokenSimulator
            tokenData={tokenData}
            onSaveTokenData={handleSaveTokenData}
            profile={profile}
            dailyKwhDemand={calcResult.kwhPerDay}
          />
        )}

        {activeTab === 'charts' && (
          <ChartsSection
            calc={calcResult}
            profile={profile}
            darkMode={theme.darkMode}
          />
        )}

        {activeTab === 'ai' && (
          <AiAdvisor
            userName={userName}
            calc={calcResult}
            profile={profile}
            tokenData={tokenData}
            tokenSim={tokenSimResult}
            onOpenAutoAnalysis={() => setIsAutoAnalysisOpen(true)}
            initialPrompt={aiInitialPrompt}
          />
        )}
      </main>

      {/* Developer Footer */}
      <Footer />

      {/* Modals */}
      <AutoAnalysisModal
        isOpen={isAutoAnalysisOpen}
        onClose={() => setIsAutoAnalysisOpen(false)}
        calc={calcResult}
        profile={profile}
        tokenData={tokenData}
        tokenSim={tokenSimResult}
        onOpenAiAdvisor={handleOpenAiAdvisorWithPrompt}
      />

      <HouseProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />

      <ApplianceFormModal
        isOpen={isApplianceFormOpen}
        onClose={() => setIsApplianceFormOpen(false)}
        applianceToEdit={applianceToEdit}
        onSave={handleSaveAppliance}
      />

      <ScanLabelModal
        isOpen={isScanLabelOpen}
        onClose={() => setIsScanLabelOpen(false)}
        onAddAppliance={handleSaveAppliance}
      />

      <VoiceInputModal
        isOpen={isVoiceInputOpen}
        onClose={() => setIsVoiceInputOpen(false)}
        onAddAppliance={handleSaveAppliance}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        userName={userName}
        onSaveUserName={handleSaveUserName}
        onDataReload={handleReloadAllData}
      />
    </div>
  );
}
