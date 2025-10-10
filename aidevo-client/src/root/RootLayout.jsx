import Navbar from '../components/layouts/Navbar';
import { Outlet } from 'react-router';
import Footer from '../components/layouts/Footer';

const RootLayout = () => {
    return (
        <>
            <header>
                <Navbar/>
            </header>
            <main className='min-h-[80vh]'>
                <Outlet></Outlet>
            </main>
            <footer>
                <Footer/>
            </footer>
        </>
    );
};

export default RootLayout;