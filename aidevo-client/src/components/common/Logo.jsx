import { Link } from 'react-router';

const Logo = () => {
    return (
        <div>
             <Link className="ml-4 text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
          Aidevo
        </Link>
        </div>
    );
};

export default Logo;