import React from 'react';
import useUserRole from '../../../../hooks/useUserRole';
import BloodBankEventCreation from './BloodBankEventCreation';
import DebateClubEventCreation from './DebateClubEventCreation';
import AssociationEventCreation from './AssociationEventCreation';

const EventCreationRoot = () => {
    const { userInfo } = useUserRole();
    
    // Check if user is organization and determine type
    if (userInfo?.role !== "organization") {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
                <p className="text-gray-600">Only organizations can create events.</p>
            </div>
        </div>;
    }

    // Determine organization type and render appropriate component
    const orgName = userInfo?.organizationName?.toLowerCase() || '';
    console.log(orgName)
    
    if (orgName.includes('blood') || orgName === 'Just blood bank') {
        return <BloodBankEventCreation />;
    } else if (orgName.includes('debate') || orgName === 'just debate club') {
        return <DebateClubEventCreation />;
    } else return <AssociationEventCreation />;
    
};

export default EventCreationRoot;