import { useAppSelector } from '@/store/hooks';
import { Building2, Globe, Users } from 'lucide-react';

export function CompanyInfo() {
  const { currentCompany, userCompanies } = useAppSelector((state) => state.company);

  if (!currentCompany) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Поточна компанія</h3>
          <p className="text-sm text-gray-400">Інформація про ваш бренд</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xl font-bold text-white mb-1">{currentCompany.title}</h4>
          {currentCompany.site_url && currentCompany.site_url.trim() && (
            <div className="flex items-center gap-2 text-gray-400">
              <Globe className="w-4 h-4" />
              <a 
                href={currentCompany.site_url.startsWith('http') ? currentCompany.site_url : `https://${currentCompany.site_url}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-purple-400 transition-colors"
              >
                {currentCompany.site_url}
              </a>
            </div>
          )}
        </div>

        {userCompanies.length > 1 && (
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              Доступ до {userCompanies.length} компаній
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
