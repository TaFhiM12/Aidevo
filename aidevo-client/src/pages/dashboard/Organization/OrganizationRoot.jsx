import React, { useEffect, useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import useUserRole from '../../../hooks/useUserRole';
import ClubProfile from './ClubProfile';
import SocialServiceProfile from './SocialServiceProfile';
import AssociationProfile from './AssociationProfile';

const OrganizationRoot = () => {
    const { user } = useAuth();
    const { userInfo } = useUserRole();
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                const response = await fetch(`http://localhost:3000/user-info/${user?.email}`);
                const data = await response.json();
                if (data.success) {
                    setOrganization(data.user);
                }
            } catch (error) {
                console.error('Error fetching organization data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.email) {
            fetchOrganization();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Organization not found</h2>
                </div>
            </div>
        );
    }

    if (userInfo?.role === 'organization') {
        switch (organization.organization?.type) {
            case 'Club':
                return <ClubProfile organization={organization} />;
            case 'Social Service':
                return <SocialServiceProfile organization={organization} />;
            case 'Association':
                return <AssociationProfile organization={organization} />;
            default:
                return <ClubProfile organization={organization} />;
        }
    }

    return null;
};

export default OrganizationRoot;