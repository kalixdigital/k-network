const SUPABASE_URL = "https://dwwyshjookspceocsxzi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3d3lzaGpvb2tzcGNlb2NzeHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMTMwODgsImV4cCI6MjA5Nzc4OTA4OH0.H2jaHYlxWccLHZpyn3huKltTsuEb_c__YkKfT89YQ0g";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

function generateReferralCode() {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "KN-";

    for (let i = 0; i < 5; i++) {
        code += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return code;
}

document
.getElementById("registerForm")
.addEventListener("submit", async function(e) {

    e.preventDefault();

    const fullName =
        document.getElementById("fullName").value;

    const phone =
        document.getElementById("phone").value;

    const opay =
        document.getElementById("opay").value;

    const password =
        document.getElementById("password").value;

    const referralCode =
        document.getElementById("referralCode").value;

    const newCode =
        generateReferralCode();

    const { error } =
        await supabaseClient
        .from("users")
        .insert([
            {
                full_name: fullName,
                phone: phone,
                password: password,
                opay_number: opay,

                referral_code: newCode,

                referred_by:
                    referralCode || null,

                rank: "Associate",

                points: 0,

                status: "pending"
            }
        ]);

    if(error){
        alert(error.message);
        return;
    }

    alert(
        "Registration Successful. Please proceed with payment."
    );

});
