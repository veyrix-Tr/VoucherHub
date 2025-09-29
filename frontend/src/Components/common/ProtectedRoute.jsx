import React, { useEffect, useState } from 'react';
import { useWallet } from '../../Context/WalletContext.jsx';
import { detectUserRole } from '../../utils/roleDetection.js';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { account, provider } = useWallet();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = async () => {
      if (account && provider) {
        try {
          const role = await detectUserRole(account, provider);
          
          if (role !== requiredRole) {
            console.log(`Access denied: User has role '${role}' but '${requiredRole}' required. Redirecting...`);
            navigate(`/${role}`);
            return;
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          navigate('/user');
          return;
        }
      } else if (!account) {
        navigate('/');
        return;
      }
      setLoading(false);
    };

    checkRole();
  }, [account, provider, requiredRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">Verifying access...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
