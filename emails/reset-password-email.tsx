import { Text, Html, Head, Body, Container, Section, Heading, Button, Link } from "@react-email/components";

interface ResetPasswordEmailProps {
	name: string;
	resetLink: string;
}

export function ResetPasswordEmail({ name, resetLink }: ResetPasswordEmailProps) {
	return (
		<Html>
			<Head />
			<Body style={{ fontFamily: "Arial, sans-serif", margin: 0, padding: 0, backgroundColor: "#f4f4f4" }}>
				<Container style={{ padding: "20px", maxWidth: "600px" }}>
					<Section style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "5px" }}>
						<Heading className="text-[24px] font-bold text-center">Password Recovery</Heading>

						<Text style={{ fontSize: "16px", lineHeight: "1.5", color: "#333333" }}>Hello {name},</Text>

						<Text style={{ fontSize: "16px", lineHeight: "1.5", color: "#333333" }}>
							We received a request to reset the password for your Dinherin account. If you did not
							request a password reset, please ignore this email.
						</Text>

						<Text style={{ fontSize: "16px", lineHeight: "1.5", color: "#333333" }}>
							To reset your password, click the button below:
						</Text>

						<Section style={{ textAlign: "center", margin: "30px 0" }}>
							<Button
								href={resetLink}
								style={{
									backgroundColor: "#4F46E5",
									color: "#ffffff",
									padding: "12px 20px",
									borderRadius: "5px",
									textDecoration: "none",
									fontWeight: "bold",
									fontSize: "16px",
								}}
							>
								Reset Password
							</Button>
						</Section>

						<Text style={{ fontSize: "16px", lineHeight: "1.5", color: "#333333" }}>
							Or copy and paste the link below into your browser:
						</Text>

						<Text style={{ fontSize: "14px", lineHeight: "1.5", color: "#4F46E5" }}>
							<Link href={resetLink} style={{ color: "#4F46E5", textDecoration: "none" }}>
								{resetLink}
							</Link>
						</Text>

						<Text style={{ fontSize: "16px", lineHeight: "1.5", color: "#333333" }}>
							This link is valid for 1 hour. After this period, you will need to request a new password
							reset.
						</Text>

						<Text style={{ fontSize: "16px", lineHeight: "1.5", color: "#333333", marginTop: "30px" }}>
							Sincerely,
							<br />
							The Dinherin.com Team
						</Text>
					</Section>

					<Text style={{ fontSize: "12px", color: "#666666", textAlign: "center", marginTop: "20px" }}>
						© 2025 Dinherin.com - All rights reserved.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}
