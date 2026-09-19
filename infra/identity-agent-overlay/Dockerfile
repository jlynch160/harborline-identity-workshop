FROM ca77cb8e7219acr.azurecr.io/board-of-advisors:59
COPY action_executor.py /app/action_executor.py
COPY patch_agent.py /overlay/patch_agent.py
COPY live-action-fragment.html /overlay/live-action-fragment.html
RUN python /overlay/patch_agent.py

