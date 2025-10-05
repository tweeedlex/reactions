-- AI Support Trigger Migration
-- Creates trigger to automatically create support tickets when AI analysis is added

-- Create function to automatically create support tickets from AI analysis
CREATE OR REPLACE FUNCTION create_support_ticket_from_ai_analysis()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert new support ticket with:
    -- status_id = 1 (Open status)
    -- ticket_type_id from ai_msg_analyze
    -- message_id from ai_msg_analyze
    INSERT INTO public.company_support_tickets (
        message_id,
        status_id,
        ticket_type_id,
        tags_array,
        created_at,
        updated_at
    ) VALUES (
        NEW.msg_id,
        1, -- Open status (assuming id=1 is 'Open' from tickets_status)
        COALESCE(NEW.msg_ticket_type_id, 1), -- Use analyzed type or default to 1
        COALESCE(NEW.tags_array, '{}'), -- Use AI-generated tags or empty array
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires after inserting into ai_msg_analyze
CREATE TRIGGER trigger_create_support_ticket_from_ai_analysis
    AFTER INSERT ON public.ai_msg_analyze
    FOR EACH ROW
    EXECUTE FUNCTION create_support_ticket_from_ai_analysis();


    drop table if exists public.company_messages;