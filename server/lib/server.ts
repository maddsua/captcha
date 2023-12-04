
type ValidationParams = {
	secretKey: string;
	challenge: string;
	minScore?: number;
};

type ValidationResult = {
	success: boolean;
	score?: number;
	error?: Error;
};

interface APIResponse {
	success: boolean;
	'error-codes'?: string[];
	score?: number;
	action?: string;
	challenge_ts?: string;
	hostname?: string;
};

/**
 * Validate reCAPTCHA
 */
export const validateReCaptcha = async (params: ValidationParams): Promise<ValidationResult> => {

	if (typeof params.challenge !== 'string') return {
		success : false,
		error: new Error('challenge token invalid')
	};

	const requestPayload = new URLSearchParams();
	requestPayload.set('secret', params.secretKey);
	requestPayload.set('response', params.challenge);

	const scoreThreshold = params.minScore || 0.5;

	try {

		const result: APIResponse = await (await fetch('https://google.com/recaptcha/api/siteverify', {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body: requestPayload.toString()
		})).json();

		if (!result.success) throw new Error(result['error-codes']?.join(', '));

		if (result.score && result.score < scoreThreshold) {
			throw new Error(`Score too low (${result.score}/${scoreThreshold})`);
		}

		return {
			success: true,
			score: result.score
		};
		
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error : new Error(JSON.stringify(error))
		};
	}	
};
