import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { stripe } from "../../services/stripe";


export default async (req: NextApiRequest, res:NextApiResponse) => {

    if (req.method === 'POST') {

        const session = await getSession({ req })

        const stripeCustomer = stripe.customers.create({
            email: session.user.email,
        })

        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: (await stripeCustomer).id,
            payment_method_types: ['card'], 
            line_items:[
                { price: 'price_1LDXpRDjYhLl1Pr8auyEWDKk', quantity: 1 }
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL
        })

        return res.status(200).json({ sessionId: stripeCheckoutSession.id })
    }else {
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}