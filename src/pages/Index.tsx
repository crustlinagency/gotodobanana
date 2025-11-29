export default function Index() {
    console.log("Index page is rendering!");
    
    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '20px',
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: '20px'
        }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>
                GoTodoBanana Test Page
            </h1>
            <p style={{ fontSize: '18px' }}>
                If you can see this, the app is loading correctly!
            </p>
            <div style={{ 
                padding: '20px', 
                backgroundColor: '#FFD93D', 
                borderRadius: '8px',
                color: '#000000'
            }}>
                Test Component Rendered Successfully ✓
            </div>
        </div>
    );
}