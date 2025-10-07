"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, 
  Languages, 
  Download, 
  Upload,
  CheckCircle,
  Clock,
  Settings,
  Users,
  FileText,
  Sparkles,
  Brain,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  status: 'complete' | 'partial' | 'pending';
  completion: number;
  contributors: number;
  lastUpdated: string;
}

interface LocalizationFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
  status: 'active' | 'beta' | 'coming-soon';
}

interface InternationalizationProps {
  onClose: () => void;
}

export function Internationalization({ onClose }: InternationalizationProps) {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [languages, setLanguages] = useState<Language[]>([
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      status: 'complete',
      completion: 100,
      contributors: 12,
      lastUpdated: '2025-09-03'
    },
    {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      flag: '🇪🇸',
      status: 'complete',
      completion: 98,
      contributors: 8,
      lastUpdated: '2025-09-02'
    },
    {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      flag: '🇫🇷',
      status: 'complete',
      completion: 95,
      contributors: 6,
      lastUpdated: '2025-09-01'
    },
    {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      flag: '🇩🇪',
      status: 'complete',
      completion: 92,
      contributors: 5,
      lastUpdated: '2025-08-30'
    },
    {
      code: 'ja',
      name: 'Japanese',
      nativeName: '日本語',
      flag: '🇯🇵',
      status: 'partial',
      completion: 78,
      contributors: 4,
      lastUpdated: '2025-08-28'
    },
    {
      code: 'zh',
      name: 'Chinese (Simplified)',
      nativeName: '简体中文',
      flag: '🇨🇳',
      status: 'partial',
      completion: 65,
      contributors: 3,
      lastUpdated: '2025-08-25'
    },
    {
      code: 'ko',
      name: 'Korean',
      nativeName: '한국어',
      flag: '🇰🇷',
      status: 'partial',
      completion: 45,
      contributors: 2,
      lastUpdated: '2025-08-20'
    },
    {
      code: 'pt',
      name: 'Portuguese',
      nativeName: 'Português',
      flag: '🇧🇷',
      status: 'pending',
      completion: 25,
      contributors: 1,
      lastUpdated: '2025-08-15'
    }
  ]);

  const [features, setFeatures] = useState<LocalizationFeature[]>([
    {
      id: 'auto-detect',
      name: 'Auto Language Detection',
      description: 'Automatically detect user\'s preferred language',
      enabled: true,
      icon: <Brain className="h-5 w-5" />,
      status: 'active'
    },
    {
      id: 'smart-translation',
      name: 'AI Translation Assistance',
      description: 'AI-powered translation suggestions for contributors',
      enabled: true,
      icon: <Sparkles className="h-5 w-5" />,
      status: 'beta'
    },
    {
      id: 'regional-formats',
      name: 'Regional Formatting',
      description: 'Localized date, time, and number formats',
      enabled: true,
      icon: <Calendar className="h-5 w-5" />,
      status: 'active'
    },
    {
      id: 'currency-localization',
      name: 'Currency Localization',
      description: 'Display amounts in local currency formats',
      enabled: true,
      icon: <DollarSign className="h-5 w-5" />,
      status: 'active'
    },
    {
      id: 'geo-localization',
      name: 'Geographic Localization',
      description: 'Location-based language and format preferences',
      enabled: false,
      icon: <MapPin className="h-5 w-5" />,
      status: 'coming-soon'
    },
    {
      id: 'collaborative-translation',
      name: 'Community Translation',
      description: 'Crowdsourced translation platform',
      enabled: true,
      icon: <Users className="h-5 w-5" />,
      status: 'beta'
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  const getFeatureStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'beta':
        return <Badge className="bg-blue-100 text-blue-800">Beta</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Coming Soon</Badge>;
    }
  };

  const getCompletionColor = (completion: number) => {
    if (completion >= 90) return 'bg-green-500';
    if (completion >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const toggleFeature = (featureId: string) => {
    setFeatures(features.map(feature => 
      feature.id === featureId 
        ? { ...feature, enabled: !feature.enabled }
        : feature
    ));
  };

  // Sample translations for demonstration
  const sampleTranslations = {
    en: {
      dashboard: "Dashboard",
      bills: "Bills",
      totalAmount: "Total Amount",
      createBill: "Create Bill",
      recentActivity: "Recent Activity"
    },
    es: {
      dashboard: "Panel de Control",
      bills: "Facturas",
      totalAmount: "Cantidad Total",
      createBill: "Crear Factura",
      recentActivity: "Actividad Reciente"
    },
    fr: {
      dashboard: "Tableau de Bord",
      bills: "Factures",
      totalAmount: "Montant Total",
      createBill: "Créer une Facture",
      recentActivity: "Activité Récente"
    },
    de: {
      dashboard: "Dashboard",
      bills: "Rechnungen",
      totalAmount: "Gesamtbetrag",
      createBill: "Rechnung Erstellen",
      recentActivity: "Letzte Aktivität"
    }
  };

  const currentTranslations = sampleTranslations[currentLanguage as keyof typeof sampleTranslations] || sampleTranslations.en;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Internationalization</h2>
          <p className="text-muted-foreground">
            Multi-language support and localization features
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-100 text-blue-800">
            <Globe className="h-3 w-3 mr-1" />
            {languages.length} Languages
          </Badge>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supported Languages</CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{languages.length}</div>
            <p className="text-xs text-muted-foreground">
              {languages.filter(l => l.status === 'complete').length} complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Translation Progress</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(languages.reduce((sum, lang) => sum + lang.completion, 0) / languages.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {languages.reduce((sum, lang) => sum + lang.contributors, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Active translators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Features</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {features.filter(f => f.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {features.length} features
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Language Selection & Preview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Language Selection</span>
            </CardTitle>
            <CardDescription>
              Choose a language to preview the interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {languages.slice(0, 4).map((language) => (
                <Button
                  key={language.code}
                  variant={currentLanguage === language.code ? "default" : "outline"}
                  onClick={() => setCurrentLanguage(language.code)}
                  className="justify-start h-12"
                >
                  <span className="text-xl mr-3">{language.flag}</span>
                  <div className="text-left">
                    <div className="font-medium">{language.name}</div>
                    <div className="text-xs text-muted-foreground">{language.nativeName}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Languages className="h-5 w-5" />
              <span>Interface Preview</span>
            </CardTitle>
            <CardDescription>
              How the interface looks in {languages.find(l => l.code === currentLanguage)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{currentTranslations.dashboard}</h4>
                <Button size="sm">{currentTranslations.createBill}</Button>
              </div>
              <div className="grid gap-2">
                <div className="flex justify-between text-sm">
                  <span>{currentTranslations.bills}</span>
                  <span>147</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{currentTranslations.totalAmount}</span>
                  <span>$2,847.50</span>
                </div>
              </div>
              <div className="text-sm font-medium">{currentTranslations.recentActivity}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Languages className="h-6 w-6" />
            <span>Language Management</span>
          </CardTitle>
          <CardDescription>
            Manage translations and localization for all supported languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {languages.map((language) => (
                <div key={language.code} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{language.flag}</span>
                    <div>
                      <h4 className="font-semibold">{language.name}</h4>
                      <p className="text-sm text-muted-foreground">{language.nativeName}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        {getStatusBadge(language.status)}
                        <span className="text-sm text-muted-foreground">
                          {language.contributors} contributors
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Updated: {language.lastUpdated}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium">{language.completion}%</div>
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${getCompletionColor(language.completion)}`}
                          style={{ width: `${language.completion}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Localization Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <span>Localization Features</span>
          </CardTitle>
          <CardDescription>
            Advanced features for international users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{feature.name}</h4>
                      {getFeatureStatusBadge(feature.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <Switch
                  checked={feature.enabled}
                  onCheckedChange={() => toggleFeature(feature.id)}
                  disabled={feature.status === 'coming-soon'}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Translation Tools */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Import Translations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="translation-file">Translation File</Label>
              <Input id="translation-file" type="file" accept=".json,.csv,.xlsx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-language">Target Language</Label>
              <select className="w-full p-2 border rounded">
                <option value="">Select language...</option>
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <Button className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Import Translations
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Export Translations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <select className="w-full p-2 border rounded">
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xlsx">Excel</option>
                <option value="po">GNU gettext (.po)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Languages</Label>
              <div className="text-sm text-muted-foreground">
                Select languages to include in export
              </div>
            </div>
            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export All Languages
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
